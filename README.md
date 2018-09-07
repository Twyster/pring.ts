# pring.ts

Firebase Cloud Firestore model framework for web.

- [Pring for iOS](https://github.com/1amageek/Pring)
- [Pring for admin](https://github.com/1amageek/pring-admin.ts)
- [Pring for web](https://github.com/1amageek/pring.ts)

⚠️ This library still contains bugs.

## Installation ⚙

`npm install pring --save `


## Usage

### tsconfig.json

Pring uses a decorator.
Set `experimentalDecorators` to `true`.

```JSON
{
  "compilerOptions": {
    "target": "es6",
    "module": "esnext",
    "strict": true,
    "jsx": "preserve",
    "importHelpers": true,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "sourceMap": true,
    "outDir": "lib",
    "baseUrl": ".",
    "types": [
      "node"
    ],
    "paths": {
      "@/*": [
        "src/*"
      ]
    },
    "lib": [
      "esnext",
      "dom",
      "dom.iterable",
      "scripthost"
    ]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "tests/**/*.ts",
    "tests/**/*.tsx"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### Initialize

When using Pring in Vue please include it in `main.ts`.


``` typescript
import * as Pring from "pring"
import { config } from "./config"
import firebase from "firebase"
import "firebase/firestore";

firebase.initializeApp()
const app = firebase.app()

Pring.initialize(app, firebase.firestore.FieldValue.serverTimestamp())
```

### Scheme

- Please add `@property` for property declaration.
- SubCollection can not be optional. Please initialize here.

``` typescript
import * as Pring from "pring"
const property = Pring.property

class Group extends Pring.Base {
    @property name: string
    @property users: NestedCollection<User> = NestedCollection(this)
}

class User extends Pring.Base {
    @property name: string
    @property groups: ReferenceCollection<Group> = ReferenceCollection(this)
}
```

### Manage data

#### Save
``` typescript
let user = new User()
user.name = "hoge"
await user.save()
```

#### Get
``` typescript
let user: User = await User.get("USER_ID", User)
```

#### Update
``` typescript
let user: User = await User.get("USER_ID", User)
user.name = "UPDATE NAME"
await user.update()
```

#### Delete
``` typescript
let user: User = await User.get("USER_ID", User)
await user.delete()
```

### SubCollection
You can use ReferenceCollection and NestedCollection.
The inserted Object is saved simultaneously with the save of the parent.


``` typescript
let user = new User()
let group = new Group()
user.groups.insert(group)
await user.save()
```

If you insert the parent after it is saved, you need to use `await` to guarantee the count of SubCollection.
``` typescript
let user = new User()
await user.save()

let group0 = new Group()
let group1 = new Group()
try {
  await user.groups.insert(group0)
  await user.groups.insert(group1)
} catch(error) {
  console.log(error)
}
```

### DataSource
DataSource is a class that controls Collection of Firestore.

``` typescript
export default class Home extends Vue {

  public async addUser() {
    const user: User = new User()
    user.name = "@1amageek"
    await user.save()
  }

  public created() {
    const dataSource = User.query().dataSource(User)
    dataSource.on((snapshot, changes) => {

      switch (changes.type) {
        case "initial": {
          console.log(dataSource.documents)
          break
        }
        case "update": {
          console.log("insert", changes.insertions)
          console.log("change", changes.modifications)
          console.log("delete", changes.deletions)
          break
        }
        case "error": {
          break
        }
      }
    }).listen()
  }
}
```

## Test

https://facebook.github.io/jest/

```shell
npm install -g jest 
```

```shell
jest
```
