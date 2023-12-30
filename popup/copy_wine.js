"use strict";

/**
 * CSS to hide everything on the page,
 * except for elements that have the "beastify-image" class.
 */
const hidePage = `body > :not(.beastify-image) {
                    display: none;
                  }`;

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
  console.log('listenForClicks addingeventlistener');

    /**
     * Given the name of a beast, get the URL to the corresponding image.
     */
    function beastNameToURL(beastName) {
      switch (beastName) {
        case "Frog":
          return browser.runtime.getURL("beasts/frog.jpg");
        case "Snake":
          return browser.runtime.getURL("beasts/snake.jpg");
        case "Turtle":
          return browser.runtime.getURL("beasts/turtle.jpg");
      }
    }

    /**
     * Insert the page-hiding CSS into the active tab,
     * then get the beast URL and
     * send a "beastify" message to the content script in the active tab.
     */
    function beastify(tabs) {
      browser.tabs.insertCSS({code: hidePage}).then(() => {
        const url = beastNameToURL(e.target.textContent);
        browser.tabs.sendMessage(tabs[0].id, {
          command: "beastify",
          beastURL: url
        });
      });
    }

    function requestLinks(tabs) {
        var promise = browser.tabs.sendMessage(tabs[0].id, {
          command: "extractLinks"
        });
        promise.then((all_wines) => {
            console.log('got data back!' + all_wines);

            var table = document.createElement("TABLE");

            for(var i = 0; i < all_wines.length; i++) {
                var trow = table.insertRow(i);
                var butt = document.createElement('BUTTON');
                var copyString = 'yada yada ' + all_wines[i].wine;
                butt.onclick = () => {
                    navigator.clipboard.writeText(copyString);
                }

                butt.innerHTML = 'Copy';
                trow.insertCell().appendChild(butt);
                trow.insertCell().innerHTML = all_wines[i].wine;
                trow.insertCell().innerHTML = all_wines[i].url;
                trow.insertCell().innerHTML = all_wines[i].stock;
                trow.insertCell().innerHTML = 'val ' + all_wines[i].qty_val;
                trow.insertCell().innerHTML = 'unit ' + all_wines[i].qty_unit;
            }

            var theadRow = table.createTHead().insertRow(0);
            var headers = ['copy', 'wine', 'url', 'stock', 'qty_val', 'qty_unit'];
            for(var i = 0; i < headers.length; i++) {
                theadRow.insertCell(i).innerHTML = headers[i];
            }

            var table_place = document.getElementById('link-content');
            table_place.appendChild(table);
        });
    }

    /**
     * Remove the page-hiding CSS from the active tab,
     * send a "reset" message to the content script in the active tab.
     */
    function reset(tabs) {
      browser.tabs.removeCSS({code: hidePage}).then(() => {
        browser.tabs.sendMessage(tabs[0].id, {
          command: "reset",
        });
      });
    }

    /**
     * Just log the error to the console.
     */
    function reportError(error) {
      console.error(`Could not beastify: ${error}`);
    }

    /**
     * Get the active tab and request it to extract links and send them
     * to us.
     */
    browser.tabs.query({active: true, currentWindow: true})
      .then(requestLinks)
      .catch(reportError);
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute beastify content script: ${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
console.log('inject content script');
browser.tabs.executeScript({file: "/content_scripts/linkex.js"})
.then(listenForClicks)
.catch(reportExecuteScriptError);
