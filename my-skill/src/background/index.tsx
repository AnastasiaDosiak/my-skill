import manifest from '../manifest.json';
import {useCallerTabId, useAbortSignal} from '@matterway/background-hooks';
import {connectToChrome} from '@matterway/puppeteer-for-chrome';

import {
    createPromiseWithCleanup,
    createSetTimeoutWithCleanup
} from '@matterway/js-core-with-cleanup';

import {
    BackgroundReact as React,
    BackgroundRenderer,
    getContentComponentsProxy
} from '@matterway/background-react';

const {
    SearchBookResults,
    Message,

} = getContentComponentsProxy<typeof import('content/components')>();

const {identifier, name} = manifest;
/**
 * @see https://docs.matterway.io/docs/automation/default-function/
 */
export default async function () {
    const tabId = useCallerTabId();
    const signal = useAbortSignal();
    // Make sure to use special Timers and Promises
    const Promise = createPromiseWithCleanup(signal);
    const setTimeout = createSetTimeoutWithCleanup(signal);

    const render = BackgroundRenderer.create(signal, {
        portName: `skill-${identifier}`,
        tabId
    });

    // Prompt input from a Skill user
    const textToInput = await render<string>(resolve => (
        // This is a custom component
        <>
            <Overlay/>
            <Bubble>
                <Spinner/>
            </Bubble>
        </>
    ));

    // Render a progress placeholder which does not require an interaction
    render((
        <Bubble>
            <StepBar
                title={name}
                step={2}
                steps={3}
                description='Running automation'
            />
            <Spinner/>
        </Bubble>
    ));

    // Run automation
    const browser = await connectToChrome(signal, {
        // Remove in case the infobar is disabled (e.g. in production)!
        // Due to bug in chrome there is a certain moment
        // when a page is not interactive when puppeteer is used.
        // https://docs.matterway.io/docs/automation/wait-for-page-interactive
        waitForPageInteractiveFix: true
    });
    const page = await browser.pageByTabId(tabId);

    try {
        const input = await page.waitForSelector(
            'input:not(:disabled):not([type="submit"])',
            {
                timeout: 5000
            }
        );

        await input.type(textToInput);
    } catch (e) {
        // React to an expected error
        await render(resolve => (
            <Bubble>
                <StepBar
                    title={name}
                    description='Something went wrong'
                    step={3}
                    steps={3}
                />
                <Message
                    text={e.message}
                    button='Continue'
                    resolve={resolve}
                />
            </Bubble>
        ));

        return;
    }

    // Display data
    const closePromise = render(resolve => (
        <Bubble>
            <StepBar
                title={name} step={3} steps={3}
                description='Workflow is complete'
            />
            <Message
                text={
                    `${name} entered ${textToInput} to an input on ${page.url()}. ` +
                    `Skill will automatically close in 10s.`
                }
                button='Continue'
                resolve={resolve}
            />
        </Bubble>
    ));

    await Promise.race([
        closePromise,
        new Promise(r => setTimeout(r, 10000))
    ]);
}
