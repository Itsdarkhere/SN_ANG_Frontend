job "l4s-frontend" {
  datacenters = ["fin-yx"]
  type = "service"


  group "l4s-bclt-front" {
    count = 2

    update {
      max_parallel = 1
      canary = 1
      min_healthy_time = "30s"
      healthy_deadline = "5m"
      auto_revert = true
      auto_promote = true
    }

    volume "frontend" {
      type = "host"
      read_only = false
      source = "frontend"
    }

    task "l4s-bclt-frontend" {
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

:{{ env "NOMAD_PORT_http" }}

file_server

# Fallback to index.html for everything but assets
@html {
  not path *.js *.css *.png *.jpg *.svg *.pdf *.eot *.ttf *.woff *.woff2 *.webmanifest

  file index.html
}

handle_errors {
  header Cache-Control no-store
}

rewrite @html {http.matchers.file.relative}

header @html Cache-Control no-store
header Access-Control-Allow-Origin "https://love4src.com"
header Content-Security-Policy "
  default-src 'self';
  connect-src 'self'
    api.love4src.com love4src.com:*
    node.deso.org
    amp.deso.org
    bithunt.deso.org
    pulse.deso.org
    bithunt.bitclout.com
    pulse.bitclout.com
    explorer.bitclout.com:*
    https://api.blockchain.com/ticker
    https://api.blockchain.com/mempool/fees
    https://ka-f.fontawesome.com/
    bitcoinfees.earn.com
    api.blockcypher.com 
    amp.bitclout.com
    pay.testwyre.com
    pay.sendwyre.com
    https://altumbase.com
    https://videodelivery.net
    https://upload.videodelivery.net;
  script-src 'self' 
    https://bitclout.com/tags.js
    https://cdn.jsdelivr.net/npm/sweetalert2@10 
    https://kit.fontawesome.com/070ca4195b.js 
    https://ka-f.fontawesome.com/;
  style-src 'self' 'unsafe-inline' 
    https://fonts.googleapis.com;
  img-src 'self' data: 
    https://i.imgur.com
    https://images.bitclout.com 
    https://images.deso.org 
    https://gfx.love4src.com
    https://arweave.net
    https://*.arweave.net
    https://cloudflare-ipfs.com
    https://quickchart.io;
  font-src 'self' https://fonts.googleapis.com 
    https://fonts.gstatic.com https://ka-f.fontawesome.com;
  frame-src 'self'
    localhost:*
    https://identity.deso.org
    https://identity.bitclout.com 
    https://identity.love4src.com
    https://geo.captcha-delivery.com
    https://gfx.love4src.com
    https://www.youtube.com
    https://youtube.com
    https://player.vimeo.com
    https://www.tiktok.com
    https://giphy.com
    https://open.spotify.com
    https://w.soundcloud.com
    https://iframe.videodelivery.net
    https://player.twitch.tv
    https://clips.twitch.tv
    pay.testwyre.com
    pay.sendwyre.com;
  frame-ancestors 'self';
        "
}
EOF
        destination = "local/Caddyfile"
      }

      resources {
        cpu    = 32
        memory = 32
        network {
          mbits = 10
          port "http" { }
        }
      }

      service {
        name = "l4s-frontend"
        port = "http"
        
        tags = [
          "internal-proxy.enable=true",
          "internal-proxy.http.routers.l4s-frontend.rule=Host(`love4src.com`)",
          "internal-proxy.http.routers.l4s-frontend.entrypoints=https"
        ]

        check {
          name     = "love4src Frontend"
          type     = "http"
          path     = "/"
          interval = "10s"
          timeout  = "5s"
          check_restart {
            limit = 30
            grace = "2s"
            ignore_warnings = true
          }
        }
      }
    }
  }
}
