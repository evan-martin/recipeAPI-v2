const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const authConfig = require("./auth_config.json");
const Recipe = require('./recipe.schema.js')
const mongoose = require('mongoose')
const dotenv = require('dotenv');
const bp = require('body-parser')

const port = process.env.API_PORT || 3001;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = authConfig.appOrigin || `http://localhost:${appPort}`;

const app = express();

app.use(cors())
app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))

dotenv.config({ path: './.env' });

if (
  !authConfig.domain ||
  !authConfig.audience ||
  authConfig.audience === "YOUR_API_IDENTIFIER"
) {
  console.log(
    "Exiting: Please make sure that auth_config.json is in place and populated with valid domain and audience values"
  );

  process.exit();
}

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
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

mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("database connected");
});

app.listen(port, () => console.log(`API Server listening on port ${port}`));