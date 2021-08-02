![BitClout Logo](https://bitclout.com/assets/img/camelcase_logo.svg)

# Clone the repo and what next?

* Setup hosts mapping
```
sudo nano /etc/hosts

# Add 127.0.0.1 dev.love4src.com

```

* Setup nginx or other proxy:

/etc/nginx/sites-available/l4s_frontend
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

# About BitClout
BitClout is a blockchain built from the ground up to support a fully-featured
social network. Its architecture is similar to Bitcoin, only it supports complex
social network data like profiles, posts, follows, creator coin transactions, and
more.

[Read about the vision](https://docs.bitclout.com/the-vision)

# About This Repo
Documentation for this repo lives on docs.bitclout.com. Specifically, the following
docs should give you everything you need to get started:
* [BitClout Code Walkthrough](https://docs.bitclout.com/code/walkthrough)
* [Setting Up Your Dev Environment](https://docs.bitclout.com/code/dev-setup)
* [Making Your First Changes](https://docs.bitclout.com/code/making-your-first-changes)
