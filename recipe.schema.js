var mongoose = require('mongoose')

var RecipeSchema = new mongoose.Schema({
    name: String,
    email: String,
    recipes: [{
        name: String,
        imageURL: String,
        ingredients: String,
        method: String,
        notes: String,
        tags: Array,
}]
          
  }, { collection: 'test' })

module.exports = mongoose.model('Recipe', RecipeSchema)
