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
      }     

      env {
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
        bithunt.bitclout.com
        pulse.bitclout.com
        explorer.bitclout.com:*
        https://api.blockchain.com/ticker
        https://api.blockchain.com/mempool/fees
        https://ka-f.fontawesome.com/
        bitcoinfees.earn.com
        api.blockcypher.com 
        amp.bitclout.com;
      script-src 'self' https://bitclout.com/tags.js https://cdn.jsdelivr.net/npm/sweetalert2@10 
        https://kit.fontawesome.com/070ca4195b.js https://ka-f.fontawesome.com/;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: i.imgur.com images.bitclout.com;
      font-src 'self' https://fonts.googleapis.com 
        https://fonts.gstatic.com https://ka-f.fontawesome.com;
      frame-src 'self' 
        https://identity.bitclout.com 
        https://identity.love4src.com
        https://www.youtube.com
        https://player.vimeo.com
        https://www.tiktok.com
        https://giphy.com
        https://open.spotify.com
        https://w.soundcloud.com;"
}
EOF
        destination = "local/Caddyfile"
      }

      resources {
        cpu    = 64
        memory = 64
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
