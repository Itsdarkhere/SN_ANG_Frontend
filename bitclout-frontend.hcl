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

    task "bclt-frontend" {
      driver = "docker"
      config {
        image = "registry.gitlab.com/love4src/frontend:[[.commit_sha]]"

        volumes = [
          "local/Caddyfile:/app/frontend/Caddyfile",
        ]

        auth {
          username = "gitlab+deploy-token-466108"
          password = "ZT8TkoV8nk-yAbFxcL54"
        }
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
        api.love4src.com love4src.com:* pdv.love4src.com
        api.bitclout.com bitclout.com:*
        api.bitpop.dev
        bithunt.bitclout.com
        pulse.bitclout.com
        bitclout.me:* api.bitclout.me:*
        localhost:*
        explorer.bitclout.com:*
        https://blockchain.info/ticker
        api.blockchain.info/mempool/fees
        https://ka-f.fontawesome.com/
        bitcoinfees.earn.com
        api.blockcypher.com 
        amp.bitclout.com
        api.bitclout.green api.bitclout.blue 
        api.bitclout.navy;
      script-src 'self' https://bitclout.com/tags.js https://cdn.jsdelivr.net/npm/sweetalert2@10 
        https://kit.fontawesome.com/070ca4195b.js https://ka-f.fontawesome.com/;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: i.imgur.com images.bitclout.com;
      font-src 'self' https://fonts.googleapis.com 
        https://fonts.gstatic.com https://ka-f.fontawesome.com;
      frame-src 'self' localhost:* 
        identity.bitclout.com identity.bitclout.blue identity.bitclout.green
        https://www.youtube.com
        https://player.vimeo.com;"
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
