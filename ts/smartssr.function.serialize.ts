declare var document: Document;
export function serializeFunction(rootNode) {
  const uuidv4 = () => {
    return 'unixxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const prependCss = (uuidID: string, styleTemplate: string) => {
    if (!styleTemplate.includes(':host')) {
      styleTemplate = `:host {}\n\n${styleTemplate}`;
    }
    styleTemplate = styleTemplate.replace(/}[ \t\n]+\./g, `}\n\n.${uuidID} .`);
    styleTemplate = styleTemplate.replace(/}[ \t\n]+\*/g, `}\n\n.${uuidID} *`);
    styleTemplate = styleTemplate.replace(/\(\[/g, `[`);
    styleTemplate = styleTemplate.replace(/\]\)/g, `]`);
    styleTemplate = styleTemplate.replace(/:host/g, `.${uuidID}`);
    styleTemplate = styleTemplate.replace(/:host/g, `.${uuidID}`);

    styleTemplate = styleTemplate.replace(/{[ \t\n]+\./g, `{\n\n.${uuidID} .`);
    styleTemplate = styleTemplate.replace(/}[ \t\n]+img/g, `}\n\n.${uuidID} img`);
    styleTemplate = styleTemplate.replace(/}[ \t\n]+div/g, `}\n\n.${uuidID} div`);
    return styleTemplate;
  };

  function serializeNode(node: HTMLElement) {
    if (!node.tagName.includes('-')) {
      return;
    }
    if (node.hasAttribute('smartssr')) {
      console.log(`${node.tagName} is already serialized`);
      return;
    }
    node.setAttribute('smartssr', 'yes');
    // lets handle the current node
    const nodeUUID = uuidv4();

    try {
      node.classList.add(nodeUUID);

      // lets modify the css
      const children: HTMLElement[] = node.shadowRoot.children as any;
      for (const childElement of children) {
        if (childElement.tagName === 'STYLE') {
          childElement.textContent = prependCss(nodeUUID, childElement.textContent);
        }
        serializeFunction(childElement);
      }

      const templateDom = document.createElement('template');
      templateDom.innerHTML = node.innerHTML;

      const slot = node.shadowRoot.querySelector('slot');
      node.childNodes.forEach(lightNode => slot.parentNode.insertBefore(lightNode, slot));
      // remove slot element
      if (slot) {
        slot.parentNode.removeChild(slot);
      }

      // move shadowDom into root node
      node.shadowRoot.childNodes.forEach(shadowNode => node.appendChild(shadowNode));

      // add original lightDom as template
      if (templateDom.innerHTML !== '') {
        node.appendChild(templateDom);
      }
    } catch (err) {
      console.log('error:', err);
      console.log(node.tagName);
    }
  }

  [...rootNode.querySelectorAll('*')]
    .filter(element => /-/.test(element.nodeName))
    .forEach(serializeNode);
}
