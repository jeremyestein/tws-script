"use strict";

function dataItemFromBI(bi) {
    var link_in_title = bi.querySelector('.basket-item__title a');
    var abs_url = link_in_title.href;
    var wine_desc = link_in_title.text;
    var stock_status_span = bi.querySelector('.badge-label');
    var item_code = bi.querySelector('.basket-item__code');

    let match = item_code.innerText.match('Code: (.*)');
    let stripped_code = match[1];

    try {
        // these might not exist if item is out of stock
        var quantity_value_sel = bi.querySelector('.basket-item__quantity-select select');
        var quantity_value = quantity_value_sel.value;
        var quantity_unit_sel = bi.querySelector('.basket-item__type select');
        var quantity_unit = quantity_unit_sel.selectedOptions[0].innerText; // only one can be selected
        var price = bi.querySelector('.basket-item__price').innerText;
    } catch (err) {
        var quantity_value = '';
        var quantity_unit = '';
        var price = '';
    }
    var item = {
        wine: wine_desc,
        code: stripped_code,
        url: abs_url,
        stock: stock_status_span.innerText,
        price: price,
        qty_val: quantity_value,
        qty_unit: quantity_unit
    };
    return item;
}

function getAllBasketItems() {
    return document.querySelectorAll('li.basket-item');
}

function determinePage() {
    if(/www.thewinesociety.com\/wishlist/.test(window.location.href)) {
        return "wishlist";
    } else if(/www.thewinesociety.com\/basket/.test(window.location.href)) {
        return "basket";
    } else if(/www.thewinesociety.com\/my-account\/order-history\/order-details/.test(window.location.href)) {
        return "order";
    } else {
        return null;
    }
}

/**
 * Generate and update the string at the top saying how many bottles/cases are in the basket
 */
function updateSummaryString() {
    var summaryDiv = document.querySelector('.summary-text-jes');
    if (summaryDiv === null) {
        return;
    }
    var type_summary = {};
    for (let bi of getAllBasketItems()) {
        var item = dataItemFromBI(bi);
        if (type_summary[item.qty_unit] === undefined) {
            type_summary[item.qty_unit] = 0;
        }
        type_summary[item.qty_unit] += parseInt(item.qty_val);
    }
    let ul = document.createElement('UL');
    for (const [key, value] of Object.entries(type_summary)) {
        let li = document.createElement('LI');
        li.innerText = `${value} x ${key}`;
        ul.appendChild(li);
    }
    summaryDiv.replaceChildren(ul);
}

function formatItemAsStr(item) {
    return `| ${item.wine} | ${item.code} | ${item.url} | ${item.stock} | ${item.price} | ${item.qty_val} | ${item.qty_unit} |`;
}

function makeCopyButtons() {
    // shopping basket items are in li tags with class "basket-item"
    console.log('makeCopyButtons says hello');

    var num_created = 0;

    var copy_all_button_class = 'copy-all-button';
    var copy_button_class = 'copy-button';
    var basket_top = document.querySelector('.basket');
    if (basket_top == null) {
        // likely the page hasn't loaded yet, don't do anything this time
        return;
    }
    var existing_all_butt = basket_top.parentElement.querySelectorAll('.' +  copy_all_button_class);
    if (existing_all_butt.length == 0) {
        num_created++;
        var summaryDiv = document.createElement('DIV');
        summaryDiv.className = 'summary-text-jes';
        basket_top.prepend(summaryDiv);
        var all_butt = document.createElement('BUTTON');
        all_butt.className = copy_all_button_class;
        all_butt.onclick = () => {
            let page = determinePage();
            let timestamp = new Date().toLocaleString();
            let copyStr = `Copied from ${page} at ${timestamp}:\n\n` // double LF or table doesn't render in obsidian
                        + '| wine | code | url | stock | price | qty_val | qty_unit |\n'
                        + '| --- | --- | --- | --- | --- | --- | --- |\n';
            for (let bi of getAllBasketItems()) {
                var item = dataItemFromBI(bi);
                copyStr += formatItemAsStr(item) + '\n';
            }
            navigator.clipboard.writeText(copyStr);
        }
        all_butt.innerHTML = 'Copy all items';
        basket_top.prepend(all_butt);
    }

    for (let bi of getAllBasketItems()) {
        var existing_butts = bi.querySelectorAll('.' +  copy_button_class);
        if (existing_butts.length > 0) {
            console.log('button already exists' + bi);
            continue;
        }
        num_created++;
        console.log('hello bi ' + bi);

        var item = dataItemFromBI(bi);
        var butt = document.createElement('BUTTON');
        butt.className = copy_button_class;
        // I'm not sure why this mess is needed, but I was previously getting
        // every button copying the *last* value copyString had in the loop.
        function onclickgen(copyStr) {
            function onclickinner() {
                navigator.clipboard.writeText(copyStr);
            }
            return onclickinner;
        }
        let copyString = formatItemAsStr(item);
        butt.onclick = onclickgen(copyString);
        butt.innerHTML = 'Copy';
        bi.prepend(butt);
    }
    console.log('Created ' + num_created + ' new elements');

    // cancel ourself if repeated calls have had no further effect
    if (num_created == 0) {
        fruitless_run_count++;
    } else {
        fruitless_run_count = 0;
    }
    if (fruitless_run_count > 10) {
        clearInterval(intervalID);
    }

}


var fruitless_run_count = 0;
var intervalID = setInterval(makeCopyButtons, 1000);
if (determinePage() == 'basket') {
    setInterval(updateSummaryString, 1000);
}

