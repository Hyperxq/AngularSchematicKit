# Schematics Kit Documentation

The purpose of this documentation is to provide a kit of simples but powerful schematics kit.
When you need to start a new angular project you usually have to do the same thing everytime. For this reason every
schematic here have an
specific configuration for your project. Feel free to contribute to improve them or create new ones.

## How to use this schematics package

<code>ng add @hyperxq/schematicskit</code>

When you have already installed the pattern to execute any schematics is:
<code>ng g @hyperxq/schematicskit:[schematic-name]</code>

## Scaffolding schematic

<code>ng g @hyperxq/schematicskit:scaffolding</code> or <code>ng g @hyperxq/schematicskit:s</code>

### Problem to solve?

Having a reliable scaffolding architecture that suits to your project is beneficial. Typically, whenever you start a new
project, you have to manually create the same scaffolding structure. However, with this schematic, you can automate the
creation of your personalized architecture. Alternatively, you can opt for a pre-defined default structure for
implementation.

### Options when you execute the schematic

1. **Select a Scaffold structure:** select defaults o custom scaffold pattern.
2. **Write the relative project url:** if you have many projects in the same workspace you need to write for example:
   projects/secondary-application.
3. **Write the url of your files structure file json:** By default, the system will search in the root of the workspace
   the file _customStructure.json_. Remember that when you create this json file you need to create inside the project.
   If you write an url that is outside you will see an error.

### Structure of JSON File

#### Interface Name: FolderStructure

| Attribute    | Type                     | Optional |
|--------------|--------------------------|:---------|
| name         | string                   | false    |
| hasModule    | boolean                  | true     |
| hasShortPath | boolean                  | true     |
| hasRouting   | boolean                  | true     |
| children     | Array of FolderStructure | true     |

It's very important to mention that this file is an array of FolderStructure interfaces. You can see and example here:
[Custom JSON File](docs/customStructure.json).

## Add Linters schematic

<code>ng g @hyperxq/schematicskit:add-linters</code> or <code>ng g @hyperxq/schematicskit:l</code>

### Problem to solve?

If you work on a team you need to make the code standards for this reason formatters and linters are needed.
This schematic allows you to immediately configure Prettier and EsLint to your project.

## Add GitHooks schematic

<code>ng g @hyperxq/schematicskit:add-git-hooks</code> or <code>ng g @hyperxq/schematicskit:gh</code>
This schematic allows you to install husky and set all the configuration needed.
