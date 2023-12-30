(function() {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {
    console.log('has already run, do nothing');

    return;
  }
  window.hasRun = true;
  console.log('running for first time...');

  /**
   * Given a URL to a beast image, remove all existing beasts, then
   * create and style an IMG node pointing to
   * that image, then insert the node into the document.
   */
  function insertBeast(beastURL) {
    removeExistingBeasts();
    let beastImage = document.createElement("img");
    beastImage.setAttribute("src", beastURL);
    beastImage.style.height = "100vh";
    beastImage.className = "beastify-image";
    document.body.appendChild(beastImage);
  }

  /**
   * Remove every beast from the page.
   */
  function removeExistingBeasts() {
    let existingBeasts = document.querySelectorAll(".beastify-image");
    for (let beast of existingBeasts) {
      beast.remove();
    }
  }

  function extractLinks() {
    // shopping basket items are in li tags with class "basket-item"

    //var all_links = document.getElementsByTagName('a');
    var basket_items = document.querySelectorAll('li.basket-item');
    var basket_items_links = document.querySelectorAll('li.basket-item > a');
    //var basket_items = document.getElementsByClassName('basket-item');
    console.log('basket_items: ')
    console.log(basket_items)
    console.log('basket_items_links')
    console.log(basket_items_links)
    var all_items = []
    for (let bi of basket_items) {
        var link_in_title = bi.querySelector('.basket-item__title a');
        var abs_url = link_in_title.href;
        var wine_desc = link_in_title.text;
        var stock_status_span = bi.querySelector('.badge-label');
        try {
            var quantity_value_sel = bi.querySelector('.basket-item__quantity-select select');
            var quantity_value = quantity_value_sel.value;
            var quantity_unit_sel = bi.querySelector('.basket-item__type select');
            var quantity_unit = quantity_unit_sel.value;
        } catch (err) {
            var quantity_value = '?';
            var quantity_unit = '?';
        }
        //var links_in_item = bi.querySelectorAll('a');
        //var links_in_item = bi.getElementsByTagName('a');
        var item = {
                wine: wine_desc,
                url: abs_url,
                stock: stock_status_span.text,
                qty_val: quantity_value,
                qty_unit: quantity_unit
        };
        all_items.push(item);
        //if (links_in_item.length > 0) {
        //    all_items.push(links_in_item[0]);
        //} else {
        //    console.log('No links in LI: ' + bi);
        //}
    }
    return all_items;
    //return [
            //"flub", "flib"
    //];
  }

  /**
   * Listen for messages from the background script.
   * Call "beastify()" or "reset()".
   */
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "beastify") {
      insertBeast(message.beastURL);
    } else if (message.command === "reset") {
      removeExistingBeasts();
    } else if (message.command === "extractLinks") {
      links = extractLinks();

      // will want to send this back as a message, but just log for now...
      console.log('links = ', links);
      return Promise.resolve(links);
    }
  });

})();

