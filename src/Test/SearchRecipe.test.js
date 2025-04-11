import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecipeSearch from "../Components/SearchRecipe"
import { act } from "react";

beforeEach(() => {
  jest.useFakeTimers();
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          recipes: [
            { id: 1, name: "Pasta", image: "pasta.jpg", ingredients: ["noodles", "sauce"] },
            { id: 2, name: "Pancake", image: "pancake.jpg", ingredients: ["flour", "milk"] },
          ],
        }),
    })
  );
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  jest.clearAllMocks();
});

test("renders input and heading", () => {
  render(<RecipeSearch />);
  expect(screen.getByPlaceholderText(/search for a recipe/i)).toBeInTheDocument();
  expect(screen.getByText(/search recipe/i)).toBeInTheDocument();
});

test("fetches and shows suggestions after input", async () => {
  render(<RecipeSearch />);
  const input = screen.getByPlaceholderText(/search for a recipe/i);
  fireEvent.change(input, { target: { value: "pa" } });

  await act(async () => {
    jest.advanceTimersByTime(300);
  });

  const suggestions = await screen.findAllByRole("listitem");
  expect(suggestions.length).toBeGreaterThan(0);
  expect(suggestions[0]).toHaveTextContent(/pasta/i);
});

test("clicking a suggestion shows recipe details", async () => {
  render(<RecipeSearch />);
  const input = screen.getByPlaceholderText(/search for a recipe/i);
  fireEvent.change(input, { target: { value: "pa" } });

  await act(async () => {
    jest.advanceTimersByTime(300);
  });

  const suggestion = await screen.findByText((_, element) =>
    element?.tagName.toLowerCase() === "li" &&
    element?.textContent?.toLowerCase().includes("pasta")
  );

  fireEvent.click(suggestion);

  expect(await screen.findByText("Ingredients:")).toBeInTheDocument();
  expect(screen.getByText("noodles")).toBeInTheDocument();
  expect(screen.getByText("sauce")).toBeInTheDocument();
  expect(screen.getByAltText("Pasta")).toHaveAttribute("src", "pasta.jpg");
});

test("shows loading while fetching", async () => {
  render(<RecipeSearch />);
  const input = screen.getByPlaceholderText(/search for a recipe/i);
  fireEvent.change(input, { target: { value: "pa" } });
   await waitFor(() => {
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
   await act(async () => {
    jest.advanceTimersByTime(300);
  });
   await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});
