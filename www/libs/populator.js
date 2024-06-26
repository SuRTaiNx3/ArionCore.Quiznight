'use strict';

window.populator = (function() {
    let populator = {
        generateId: function(prefix) {
            return prefix + Math.round(Math.random()*1e8).toString(16);
        },
        populate: function(templateSelector, data) {
            let template = document.querySelector(templateSelector);
            if (!data || !template) {
                return;
            }

            if (data.length) {
                populateFromArray(template, data);
            } else {
                populateFromObject(template, data)
            }
        },
        populateFromJson: async function() {
            const jsonElems = document.querySelectorAll('[data-json]');
            for (let i = 0; i < jsonElems.length; i++) {
                const filename = jsonElems[i].getAttribute('data-json');
                const data = await getData(filename);
                const dataTree = jsonElems[i].getAttribute('data-tree');
                if (dataTree !== undefined && dataTree !== null) {
                    populateTree(jsonElems[i], data);
                } else {
                    populateFromArray(jsonElems[i], data);
                }
                const postHandler = jsonElems[i].getAttribute('data-post-json');
                if (!!postHandler) {
                    postHandler();
                }
            }
        },
        populateTree: function(templateSelector, data) {
            let template = document.querySelector(templateSelector);
            if (!data || !template) {
                return;
            }

            populateTree(template, data);
        }
    };

    function populateTree(template, data) {
        const parentElem = template.parentElement;
        const nodeElems = template.querySelector('[data-node]');
        const leafElems = template.querySelector('[data-leaf]');
        populateTreeChildren(data, parentElem, template, nodeElems, leafElems);

        parentElem.removeChild(template);
    }

    function populateTreeChildren(list, parentElem, siblingElem, nodeElems, leafElems) {
        for (let idx = 0; idx < list.length; idx++) {
            const item = list[idx];
            if (item.nodes !== undefined && item.nodes !== null) {
                const elem = nodeElems.cloneNode(true);
                populateFromObject(elem, item);
                if (!!siblingElem) {
                    parentElem.insertBefore(elem, siblingElem);
                } else {
                    parentElem.appendChild(elem);
                }
                const contElement = elem.querySelector('[data-content]');

                populateTreeChildren(item.nodes, contElement, null, nodeElems, leafElems)
            } else {
                const elem = leafElems.cloneNode(true);
                populateFromObject(elem, item);
                if (!!siblingElem) {
                    parentElem.insertBefore(elem, siblingElem);
                } else {
                    parentElem.appendChild(elem);
                }
            }
        }
    }

    function populateFromObject(elem, obj) {
        for (let idx = 0; idx < elem.attributes.length; idx++) {
            const attr = elem.attributes[idx];
            attr.value = fillValue(attr.value, obj);
        }
        elem.innerHTML = fillValue(elem.innerHTML, obj);
    }

    function populateFromArray(template, arr) {
        let parentElem = template.parentElement;
        parentElem.removeChild(template);

        for (let i = 0; i < arr.length; i++) {
            let elem = template.cloneNode(true);
            populateFromObject(elem, arr[i]);
            parentElem.appendChild(elem);
        }
    }

    function fillValue(value, obj) {
        let result = value;
        Object.keys(obj).forEach(function(key) {
            result = result.replace('[[' + key + ']]', obj[key]);
        });
        return result;
    }

    async function getData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Can\'t read data from ${url}. Status code: ${response.status}`);
        }
        return await response.json();
    }

    return populator;
}());