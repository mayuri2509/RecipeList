import React, { Component } from "react";
import debounce from "lodash.debounce";
  
class RecipeSearch extends Component {
  state = {
    query: "",
    suggestions: [],
    selectedRecipe: null,
    loading: false,
  };
  
  fetchRecipes = debounce(async (query) => {
    if (!query) return;
    this.setState({ loading: true });

    try {
      const response = await fetch(`https://dummyjson.com/recipes/search?q=${query}`);
      const data = await response.json();
      this.setState({ suggestions: data.recipes.slice(0, 5), loading: false });
    } catch (error) {
      console.error("Error fetching recipes:", error);
      this.setState({ loading: false });
    }
  }, 300);

  handleInputChange = (event) => {
    const query = event.target.value;
    this.setState({ query, selectedRecipe: null });
    if (query.trim()) {
      this.fetchRecipes(query);
    } else {
      this.setState({ suggestions: [] });
    }
  };

  handleSuggestionClick = (recipe) => {
    this.setState({ selectedRecipe: recipe, suggestions: [], query: recipe.name });
  };

  highlightMatch = (text) => {
    const { query } = this.state;
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, "<strong>$1</strong>");
  };

  render() {
    const { query, suggestions, selectedRecipe, loading } = this.state;

    return (
      <div className="container">
        <div className="conatiner2">
        <h1>Search Recipe</h1>
        <input
          type="text"
          id="input"
          value={query}
          onChange={this.handleInputChange}
          placeholder="Search for a recipe..."
        />

        {loading && <p>Loading...</p>}
        <ul className="suggestions">
          {suggestions.map((recipe) => (
            <li key={recipe.id} onClick={() => this.handleSuggestionClick(recipe)}>
              <span dangerouslySetInnerHTML={{ __html: this.highlightMatch(recipe.name) }} />
            </li>
          ))}
        </ul>

        {selectedRecipe && (
          <div className="recipe-details">
            <h3>{selectedRecipe.name}</h3>
            <img src={selectedRecipe.image} alt={selectedRecipe.name} width="200" />
            <h4>Ingredients:</h4>
            <ol>
              {selectedRecipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ol>
          </div>
        )}
        </div>
      </div>
    );
  }
}

export default RecipeSearch;

