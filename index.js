const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const helmet = require("helmet")
const { expressjwt: jwt } = require("express-jwt")
const jwksRsa = require("jwks-rsa")
const Recipe = require('./recipe.schema.js')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const bp = require('body-parser')
const app = express()

dotenv.config({ path: './.env' })
const port = process.env.PORT || 3001
const db = process.env.DB
const domain = process.env.DOMAIN
const clientId = process.env.CLIIENTID
const audience = process.env.AUDIENCE
const appOrigin = process.env.APPORIGIN


app.use(cors())
app.use(morgan("dev"))
app.use(helmet())
app.use(cors({ origin: appOrigin }))
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))



const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${domain}/.well-known/jwks.json`,
  }),

  audience: audience,
  issuer: `https://${domain}/`,
  algorithms: ["RS256"],
});

//get user data and recipes
app.get("/api/recipes", checkJwt, (req, response) => {
  Recipe.findOne({ email: req.headers.user }, function (err, result) {
    if (err) console.log(err)
    response.send({
      result
    });
  })
});

//add new recipe
app.put("/api/recipes/new-recipe", checkJwt, (req, response) => {
  Recipe.findOneAndUpdate({ email: req.headers.user }, { $push: { recipes: req.body } }, (err, result) => {
    if (err) console.log(err)
    response.send({ result })
  })
});

//update recipe:
app.put("/api/recipes/update", checkJwt, (req, response) => {
  Recipe.findOneAndUpdate({ email: req.headers.user, 'recipes._id': req.headers.recipe },
    {
      'recipes.$.name': req.body.name,
      'recipes.$.imageURL': req.body.imageURL,
      'recipes.$.ingredients': req.body.ingredients,
      'recipes.$.method': req.body.method,
      'recipes.$.tags': req.body.tags,
    }, (err, result) => {
      if (err) console.log(err)
      console.log(result)
      response.send({ result })
    })
});

//delete recipe
app.delete("/api/recipes/delete", checkJwt, (req, response) => {
  Recipe.findOneAndUpdate({ email: req.headers.user, 'recipes._id': req.headers.recipe },
    {
      $pull: { recipes: {'_id': req.headers.recipe }}

    }, (err, result) => {
      if (err) console.log(err)
      response.send({ result })
    })
});

mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("database connected");
});

app.listen(port, () => console.log(`API Server listening on port ${port}`));