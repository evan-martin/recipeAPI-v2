var mongoose = require('mongoose')

var RecipeSchema = new mongoose.Schema({
  email: String,
  recipes: [{
    name: String,
    imageURL: String,
    ingredients: String,
    method: String,
    notes: String,
    tags: Array,
  }],
  shoppinglist: Array

}, { collection: 'test' })

module.exports = mongoose.model('Recipe', RecipeSchema)
