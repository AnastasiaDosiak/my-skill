// Keep import 'icon.png';
// It allows to include icon.png to skill.zip without any other scripts.
import '../icon.png';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {createSkillMountRoot} from 'content/lib/create-skill-mount-root';
import {BackgroundContent} from '@matterway/background-react/content';
import * as contentComponents from 'content/components';
import {Root as DesignSystemRoot} from '@matterway/assistant-design-system/content';

const manifest = require('../manifest.json');

const reactMountRoot = createSkillMountRoot({
  manifest,
  onDestroy: ReactDOM.unmountComponentAtNode
});

ReactDOM.render(
  <DesignSystemRoot styleSheetTarget={reactMountRoot}>
    <BackgroundContent
      chromeRuntime={chrome.runtime}
      contentComponents={contentComponents}
      portName={`skill-${manifest.identifier}`}
    />
  </DesignSystemRoot>,
  reactMountRoot
);
