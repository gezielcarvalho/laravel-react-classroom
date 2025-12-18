export {};

beforeEach(() => {
  // Ensure fresh module import executes index.tsx each test
  jest.resetModules();
  // Prepare a DOM root element like in index.tsx
  const rootDiv = document.createElement("div");
  rootDiv.id = "root";
  document.body.appendChild(rootDiv);
});

afterEach(() => {
  // Clean up DOM
  document.body.innerHTML = "";
  jest.restoreAllMocks();
});

test("calls ReactDOM.createRoot and renders the App", () => {
  const renderMock = jest.fn();

  // Spy on the actual react-dom/client module before importing index.tsx
  const ReactDOM = require("react-dom/client");
  const createRootSpy = jest
    .spyOn(ReactDOM, "createRoot")
    .mockReturnValue({ render: renderMock } as any);

  // Require the module after spies are set so the auto-mount runs under test control
  require("./index");

  expect(createRootSpy).toHaveBeenCalledWith(document.getElementById("root"));
  expect(renderMock).toHaveBeenCalled();
});

test("does not call createRoot when no root element exists", () => {
  jest.resetModules();
  // remove any root element
  document.body.innerHTML = "";

  const renderMock = jest.fn();
  const ReactDOM = require("react-dom/client");
  const createRootSpy = jest
    .spyOn(ReactDOM, "createRoot")
    .mockReturnValue({ render: renderMock } as any);

  require("./index");

  expect(createRootSpy).not.toHaveBeenCalled();
  expect(renderMock).not.toHaveBeenCalled();
});
