declare var document: Document;
export function serializeFunction(rootNode) {
  const uuidv4 = () => {
    return 'unixxxxxxxxxxx'.replace(/[xy]/g, (c) => {
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
  const loopProtection: any[] = [];

  function serializeNode(nodeArg: HTMLElement, logThis = false) {
    if (loopProtection.includes(nodeArg)) {
      return;
    }
    loopProtection.push(nodeArg);
    // console.log(nodeArg.nodeName);
    if (nodeArg.shadowRoot) {
      nodeArg.setAttribute('smartssr', 'yes');

      // lets handle the current node
      const nodeUUID = uuidv4();

      nodeArg.classList.add(nodeUUID);
      const slots = nodeArg.shadowRoot.querySelectorAll('slot');

      // handle slot element
      const slotsForMove: HTMLSlotElement[] = [];
      slots.forEach((slot) => {
        slotsForMove.push(slot);
      });

      
      for (const slot of slotsForMove) {
        const slottedLightNodesForMove = [];
        slot.assignedNodes().forEach((lightNode) => slottedLightNodesForMove.push(lightNode));
        slottedLightNodesForMove.forEach((lightNode) => slot.parentNode.insertBefore(lightNode, slot));
      }

      // lets modify the css
      const childNodes = nodeArg.shadowRoot.childNodes;
      // tslint:disable-next-line: prefer-for-of
      const noteForAppending: HTMLElement[] = [];
      childNodes.forEach((childNode) => {
        if (childNode instanceof HTMLElement) {
          if (childNode.tagName === 'STYLE') {
            childNode.textContent = prependCss(nodeUUID, childNode.textContent);
          } else {
            serializeNode(childNode, logThis);
          }
          noteForAppending.push(childNode);
        }
      });
      noteForAppending.forEach((childNode) => {
        nodeArg.append(childNode);
      });
    } else {
      nodeArg.childNodes.forEach((nodeArg2: any) => {
        serializeNode(nodeArg2, logThis);
      });
    }
  }

  rootNode.childNodes.forEach((nodeArg) => {
    serializeNode(nodeArg);
  });
}
