# React component for Monaco-Editor and Monaco Languageclient

This packages provides a React component that wraps `monaco-editor`. It behaves in nearly the same way as the monaco editor, with the primary difference being that you interact with it through a React component.

The `monaco-languageclient` can be activated to connect to a language server either via jsonrpc over a websocket to an exernal server process or via language server protocol for browser where the language server runs in a web worker.

## Getting Started

If you have node.js LTS available, then from the root of the project run:

```bash
npm i
npm run build
```

Afterwards launch the Vite.js development mode:

```bash
npm run dev
```

You find examples (manual human testing) in the root of the repository [index.html](../../index.html). They can be used once Vite is running.

## Usage

You can import the monaco react component for easy use in an existing React project. Below you can see a quick example of a fully functional implementation for some TypeScript.

```ts
import { MonacoEditorReactComp, addMonacoStyles } from 'monaco-editor-react/allLanguages';

addMonacoStyles('monaco-editor-styles');

const languageId = 'typescript';

const codeMain = `function sayHello(): string {
    return "Hello";
};`;

const comp = <MonacoEditorReactComp
    languageId={languageId}
    text={codeMain}
    style={{
        'paddingTop': '5px',
        'height': '100%',
        'width': '100%'
    }}
/>;
```

You can also pass in custom syntax highlighting using the Monarch language. Here's an example for a simple statemachine language.

```ts
// helps to bring in Monaco from the wrapper, but not required
import { monaco } from 'monaco-editor-wrapper';

const syntaxHighlighting = {
  keywords: [
      'actions', 'commands', 'end', 'events', 'initialState', 'state', 'statemachine'
  ],
  tokenizer: {
      root: [
          [/[a-z_$][\w$]*/, {
              cases: {
                  '@keywords': 'keyword',
                  '@default': 'identifier'
              }
          }],
          { include: '@whitespace' }
      ],
      comment: [
          [/[^\/*]+/, 'comment'],
          [/\/\*/, 'comment', '@push'],
          ["\\*/", 'comment', '@pop'],
          [/[\/*]/, 'comment']
      ],
      whitespace: [
          [/[ \t\r\n]+/, 'white'],
          [/\/\*/, 'comment', '@comment'],
          [/\/\/.*$/, 'comment'],
      ]
  }
} as monaco.languages.IMonarchLanguage;

...

<MonacoEditorReactComp
    languaegId="statemachine"
    text={codeMain}
    syntax={syntaxHighlighting}>
```

## Bundled Usage

For special cases where you might want the component to be processed in advance, so we also provide a pre-bundled version that you can reference instead. This can be helpful if you're working within some other framework besides React (Hugo for example).

```ts
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react/bundle';

...

const comp = <MonacoEditorReactComp languageId="statemachine" text={codeMain}/>
```

## Invoking Custom Commands

*An experimental feature.*

If you have hooked up this component to talk with a language server, then you also may want to invoke custom LSP commands. This can be helpful when you want to perform specific actions on the internal representation of your language, or when you want to expose some details about your language for use in your React application. This could include generator functionality, such that other parts of your application can interact with your language without knowledge of the language server's internals.

Custom commands can be invoked by getting a reference to your Monaco component. This *breaks* the standard encapsulation that React is built on, so no guarantees this won't cause other issues with your React app.

```ts
// based on the official React example for refs:
// https://reactjs.org/docs/refs-and-the-dom.html#creating-refs

class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  render() {
    return <MonacoEditorReactComp ref={this.myRef} .../>;
  }
}
```

You can then access the `current` property of the ref to get a refernce to your component. This can then be used to invoke the executeCommands function present in the component.

```ts
this.myRef.current.executeCommand('myCustomCommand', args...);
```

This will return an instance of `Thenable`, which should contain the returned data of executing your custom command. As you can imagine, this is incredibly helpful for getting internal access for specific language handilng, but without needing details about the internals of your language server to do it.

