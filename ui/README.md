## Deployment

```
heroku git:remote -r prod -a mapping-ui
(cd ..; git push prod --force `git subtree split --prefix ui HEAD`:refs/heads/master)
```
