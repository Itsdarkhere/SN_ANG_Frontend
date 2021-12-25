![DeSo Logo](src/assets/deso/camelcase_logo.svg)

# Clone thse repo and get yourself started?
```
git clone https://gitlab.com/love4src/frontend.git
```

* Setup hosts mapping
```
sudo nano /etc/hosts

# Add 127.0.0.1 dev.love4src.com

```

* Setup nginx or other proxy:
```
sudo nano /etc/nginx/sites-available/l4s_frontend
```
```
upstream l4s_frontend {
        server localhost:4200;
}

server {
        listen 80;
        listen [::]:80;

        server_name dev.love4src.com;

        location / {
                proxy_pass http://l4s_frontend;
        }
        location /api/ { 
                proxy_pass https://api.love4src.com;
        }
}

```
```
sudo ln -s /etc/nginx/sites-available/l4s_frontend /etc/nginx/sites-enabled/l4s_frontend

sudo systemctl restart nginx
```

Optionally, setup the ssl:
```
openssl req -x509 -sha256 -nodes -days 765 -newkey rsa:2048 -keyout dev-love4src.key -out dev-love4src.crt
```

```
upstream l4s_frontend {
        server localhost:4200;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;

    ssl_certificate dev-love4src.crt;
    ssl_certificate_key dev-love4src.key;

    server_name dev.love4src.com;

    try_files $uri /index.html =404;

    location / {
        proxy_pass http://l4s_frontend;
    }

    location /api/ { 
        proxy_pass https://api.love4src.com/;
        proxy_redirect off;
    }
}
```

* Setup nodejs and angular (Ubuntu)
```
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# relogin / re-run profile

npm install -g @angular/cli

npm install 
```

* Start the frontend (optionally disabling host check)
```
ng serve --disable-host-check
```

# About DeSo
DeSo is a blockchain built from the ground up to support a fully-featured
social network. Its architecture is similar to Bitcoin, only it supports complex
social network data like profiles, posts, follows, creator coin transactions, and
more.

[Read about the vision](https://docs.deso.org/#the-ultimate-vision)

Docs should give you everything you need to get started:
* [DeSo Code Walkthrough](https://docs.deso.org/code/walkthrough)
* [Setting Up Your Dev Environment](https://docs.deso.org/code/dev-setup)
* [Making Your First Changes](https://docs.deso.org/code/making-your-first-changes)

# Start Coding
The quickest way to contribute changes to the BitClout Frontend is the following these steps:

1. Open frontend repo in Gitpod

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/deso-protocol/frontend)

You can use any repo / branch URL and just prepend `https://gitpod.io/#` to it.

2. If needed, login to your github account

3. Set the correct `lastLocalNodeV2`  to `"https://api.tijn.club"` in your browser Local Storage for the gitpod preview URL

4. Create a new branch to start working

To commit / submit a pull reqest from gitpod, you will need to give gitpod additional permissions to your github account: `public_repo, read:org, read:user, repo, user:email, workflow` which you can do on the [GitPod Integrations page](https://gitpod.io/integrations).

