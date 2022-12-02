import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { MonacoEditor, MonacoEditorProps } from '../monaco-editor';

export default {
    title: 'MonacoEditor',
    component: MonacoEditor,
} as ComponentMeta<typeof MonacoEditor>;

const Template: ComponentStory<typeof MonacoEditor> = (args: MonacoEditorProps) => <MonacoEditor {...args} style={{height: '100%'}}/>;

export const Primary = Template.bind({});
Primary.args = {
    text: 'Example program text',
    languageId: 'statemachine'
};
