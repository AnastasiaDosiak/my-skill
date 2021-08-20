import {AssistantTestingMode, assistantTestingModeWindowProperty} from '@matterway/assistant-skill-interface';

const maxZIndexForContent = Math.pow(2, 31) - 2;

function fixReactForShadowRoot(
  shadowRoot: ShadowRoot,
  reactMountRoot: HTMLElement,
  document: Document
) {
  // See https://github.com/facebook/react/issues/9242
  (shadowRoot as any).createElement = document.createElement.bind(document);
  (shadowRoot as any).createElementNS = document.createElementNS.bind(document);
  (shadowRoot as any).createTextNode = document.createTextNode.bind(document);

  Object.defineProperty(reactMountRoot, 'ownerDocument', {
    value: shadowRoot
  });
}

export function createSkillMountRoot(options: {
  manifest: {identifier: string};
  onDestroy: (reactMountRoot: HTMLElement) => any;
}) {
  const {document} = window.top;
  const root = document.createElement('mw-assistant-skill');
  root.setAttribute('data-skill-identifier', options.manifest.identifier);
  const reactMountRoot = document.createElement('div');
  reactMountRoot.style.pointerEvents = 'none';
  reactMountRoot.style.position = 'fixed';
  reactMountRoot.style.top = '0';
  reactMountRoot.style.right = '0';
  reactMountRoot.style.bottom = '0';
  reactMountRoot.style.left = '0';
  reactMountRoot.style.zIndex = String(maxZIndexForContent);

  const {
    [assistantTestingModeWindowProperty]: testingMode
  } = window as {
    [assistantTestingModeWindowProperty]?: AssistantTestingMode
  };

  if (
    testingMode === AssistantTestingMode.SKILL_INTEGRATION_TESTS ||
    testingMode === AssistantTestingMode.SKILL_UNIT_TESTS
  ) {
    root.appendChild(reactMountRoot);
    document.body.appendChild(root);
  } else {
    const shadowRoot = root.attachShadow({
      mode: testingMode ? 'open' : 'closed'
    });
    shadowRoot.appendChild(reactMountRoot);
    fixReactForShadowRoot(shadowRoot, reactMountRoot, document);
    document.documentElement.appendChild(root);
  }

  window.addEventListener('unload', () => {
    root.remove();
    options.onDestroy(reactMountRoot);
  });

  return reactMountRoot;
}
