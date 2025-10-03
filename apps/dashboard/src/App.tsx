import { Button, Input, Radio, Label, Dialog } from '@dalmaki/gandan'
import './App.css'

function App() {
  return (
    <>
      <h1>Dashboard</h1>
      <p>
        This is an example dashboard application to demonstrate gandan-ui.
      </p>
      <p>
        Check out the <code>packages/gandan</code> package for the components.
      </p>
      <Label t="input" htmlFor="ExampleInput">
        Example Input:
      </Label>
      <div className="inputSet">
        <Input id="ExampleInput" placeholder="Type something..." />
        <Button v="pri" onClick={() => alert('Button clicked!')}>Click me</Button>
      </div>
      <Dialog open>
        <div className="dialogContent">
          <h2>Example Dialog</h2>
          <p>This is an example dialog using the Dialog component from gandan-ui.</p>
        </div>
      </Dialog>
    </>
  )
}

export default App
