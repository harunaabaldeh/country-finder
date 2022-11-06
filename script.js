const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const $$$ = (a) => Array.from(a);

async function searchCountry(sugg) {
  return await fetch(`https://restcountries.com/v3.1/name/${sugg}`);
}

let timerSuggestions = null;
const suggList$ = $("#suggestion-list");
const reset$ = $("#reset");
const suggInput$ = $("suggestions");

const suggestionType = {
  DEFAULT: "default",
  ERROR: "error",
};

const toggleLoading = (isLoading) => {
  if (isLoading) $("#suggestion-input").classList.add("loading");
  else $("#suggestion-input").classList.remove("loading");
};

const createSuggestionDom = (sugg) => {
  const sugg$ = document.createElement("div");
  sugg$.classList.add("suggestion");
  sugg$.classList.add(sugg.type);
  sugg$.innerText = sugg.message;

  if (sugg.flag) {
    const flag$ = document.createElement("img");
    flag$.src = sugg.flag;
    flag$.alt = "Image";
    sugg$.appendChild(flag$);
    sugg$.addEventListener(
      "click",
      () => {
        suggInput$.value = sugg.message;
        resetApp(false);
      },
      false
    );
  }
  return sugg$;
};

const undateSuggestion = (list, direct = false) => {
  suggList$.innerText = "";
  if (direct) {
    suggList$.appendChild(
      createSuggestionDom({
        message: list.message,
        type: list.type,
      })
    );
  } else {
    list.forEach((country) => {
      suggInput$.appendChild(
        createSuggestionDom({
          message: country.name,
          type: suggestionType.DEFAULT,
          flag: country.flag,
        })
      );
    });
  }
  if (list.length > 0 || direct) {
    suggList$.classList.add("displayed");
    reset$.classList.add("displayed");
  }
};

function searchEvent(searchValue) {
  toggleLoading(true);
  searchCountry(searchValue)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      toggleLoading(false);
      if (data.status < 200 || data.status >= 300) {
        undateSuggestion(
          {
            message: data.message,
            type: suggestionType.ERROR,
          },
          true
        );
      } else {
        undateSuggestion(data);
      }
    });
}

reset$.addEventListener(
  "click",
  () => {
    resetApp();
  },
  false
);

function resetApp(withInput = true) {
  suggList$.classList.remove("displayed");

  if (withInput) {
    suggInput$.value = "";
    reset$.classList.remove("displayed");
  }

  suggInput$.addEventListener(
    "input",
    (e) => {
      clearTimeout(timerSuggestions);
      suggList$.classList("displayed");
      reset$.classList.remove("displayed");

      if (e.target.value.length < 2) return;

      timerSuggestions = setTimeout(() => {
        searchEvent(e.target.value.toLowerCase());
      }, 500);
    },
    false
  );
}
