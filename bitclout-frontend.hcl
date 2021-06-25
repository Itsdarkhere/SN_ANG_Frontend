job "bitclout-frontend" {
  datacenters = ["fin-yx"]
  type = "service"
  
  group "bclt-front" {
    
    restart {
      attempts = 3
      interval = "5m"
      delay = "60s"
      mode = "delay"
    }

    volume "frontend" {
      type = "host"
      read_only = false
      source = "frontend"
    }

    task "bclt-frontend" {
      driver = "docker"
      config {
        image = "registry.gitlab.com/love4src/frontend:[[.commit_sha]]"

        volumes = [
          "local/Caddyfile:/app/frontend/Caddyfile",
        ]

        auth {
          username = "gitlab+deploy-token-472662"
          password = "UVxsg7AR5dPeUDwGhDNo"
        }
      }     

      env {
          GLOG_V=0
          RATE_LIMIT_FEERATE=0
          MIN_FEERATE=1000
          TARGET_OUTBOUND_PEERS=8
          LIMIT_ONE_INBOUND_CONNECTION_PER_IP=true
          STALL_TIMEOUT_SECONDS=900
          PRIVATE_MODE=false
          STARTER_BITCLOUT_AMOUNT_NANOS=1000000
          ACCESS_CONTROL_ALLOW_ORIGINS="*"
          AMPLITUDE_DOMAIN=api.amplitude.com
          MIN_SATOSHIS_BURNED_FOR_PROFILE_CREATION=500000
          FORCE_SSL=false
          SUPPORT_EMAIL="andy@astronation.world"
          LOG_DB_SUMMARY_SNAPSHOTS=false
          SHOW_PROCESSING_SPINNERS=true
          CADDY_FILE="/app/frontend/Caddyfile"
      }
      

      volume_mount {
        volume = "frontend"
        destination = "/app"
        read_only = false
      }


      template {
        data = <<EOF

{
    admin off
    auto_https off
}

:8080 {
    file_server
    try_files {path} index.html

    header Access-Control-Allow-Methods "GET, PUT, POST, DELETE, OPTIONS"
    header Access-Control-Allow-Origin "https://love4src.com"
    header Content-Security-Policy "
      default-src 'self';
      connect-src 'self'
        api.love4src.com love4src.com:* 
        api.bitclout.com bitclout.com:*
        api.bitpop.dev
        bithunt.bitclout.com
        pulse.bitclout.com
        bitclout.me:* api.bitclout.me:*
        localhost:*
        explorer.bitclout.com:*
        https://api.blockchain.com/ticker
        https://api.blockchain.com/mempool/fees
        https://ka-f.fontawesome.com/
        bitcoinfees.earn.com
        api.blockcypher.com 
        amp.bitclout.com
        api.bitclout.green api.bitclout.blue 
        api.bitclout.navy
        api.testwyre.com
        api.sendwyre.com;
      script-src 'self' https://bitclout.com/tags.js https://cdn.jsdelivr.net/npm/sweetalert2@10 
        https://kit.fontawesome.com/070ca4195b.js https://ka-f.fontawesome.com/;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: i.imgur.com images.bitclout.com;
      font-src 'self' https://fonts.googleapis.com 
        https://fonts.gstatic.com https://ka-f.fontawesome.com;
      frame-src 'self' localhost:* 
        identity.bitclout.com identity.bitclout.blue identity.bitclout.green
        https://www.youtube.com
        https://player.vimeo.com
        https://www.tiktok.com
        pay.testwyre.com
        pay.sendwyre.com;"
}

EOF

        destination = "local/Caddyfile"

      }

      resources {
        cpu    = 128
        memory = 128
        network {
          mbits = 10
          port "http" {
            static = 8080
          }
        }
      }

      service {
        name = "bitclout-frontend"
        port = "http"
        
        tags = [
          "internal-proxy.enable=true",
          "internal-proxy.http.routers.bitclout-frontend.rule=Host(`love4src.com`)",
          "internal-proxy.http.routers.bitclout-frontend.tls=true",
          "internal-proxy.http.routers.bitclout-frontend.tls.certresolver=astroresolver"
        ]

        check {
          name     = "BitClout Frontend"
          type     = "http"
          path     = "/"
          interval = "120s"
          timeout  = "30s"
          check_restart {
            limit = 3
            grace = "30s"
            ignore_warnings = true
          }
        }
      }
    }

  }
}
