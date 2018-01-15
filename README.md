# force-dev-tool-for-vs

This is a VS Code extension to enhance the usablity of the force-dev-tool inside VS Code.
It helps you getting more productive by not having to leave VS Code.
To deploy or check your code the extesion creates an temporary Change Set which will be deployed / checked automatically.

## Requirements

- This extension works only on unix based systems

## Features
All commands will be executed in your default Org. If you want to execute them to a specific org please use the perfom in specific Org option which is available for the most commands.

### Apex Class Context Menu:
- `Create new Change Set`
- `Create new destrutive Change Set`
- `Deploy Class`
- `Check Class`
- `Execute Test Class`

### Editor Context Menu
- `Execute Selected SOQL`
To execute an SOQL query please select the whole query you want to execute. Perfom a right click on the selected query and choose `Execute Selected SOQL`.
- `Execute Selected APEX anonymous`
To execute anonymous APEX code please select the lines you want to execute. Perfom a right click on the selected lines and choose `Execute Selected APEX anonymous`. If it runs successfully you won't get the response inside the output window. But you can use the Logs inside Salesforce Developer Console to debug your execution.

### Commands:
- `Add Default Remote`
Instead of using this command it's recommended to add your remotes manually.
```console
$ force-dev-tool remote add production user pass3 https://login.salesforce.com
```
- `Change default Remote`
- `Login`
- `Fetch`
- `Package All`
Creates a package.xml with all metadata indexed.
- `Retrieve`
Retrieves the specified metadata from your Org.
- `Test`
Executes all test classes.
- `Execute Test Class`
Type in the name of your test class which should be executed.
- `Create Change Set`
Type in the filename (including the path) of your class. 
Example: src/classes/foo.cls
- `Create destrcuctive Change Set`
Type in the filename (including the path) of your class. 
Example: src/classes/foo.cls
- `Deploy`
Type in the filename (including the path) of your class. 
Example: src/classes/foo.cls
- `Check uncommitted changes`
This will check all your changes since the last commit to your org.
- `Check Class`
Type in the filename (including the path) of your class. 
Example: src/classes/foo.cls

Most of the command have a perform in specific org option. This options let's choose you your org where the command will be executed.

## Issues / Feature requests
You can submit your issues and feature requests on the GitHub [issues](https://github.com/kvnE/force-dev-tool-for-vs/issues).

## Credits
Command execution based on [bbenoist/vscode-shell](https://github.com/bbenoist/vscode-shell)
and
force-dev-tool: [amtrack/force-dev-tool](https://github.com/amtrack/force-dev-tool)