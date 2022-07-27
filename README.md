# Shartube
### Online sharing platform

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`DB_HOST`
`DB_PORT`
`DB_USERNAME`
`DB_PASSWORD`
`DB_NAME`
`JWT_SECRET`


## Run Locally

Clone the project

### Frontend

If you want to run web application, please visit here.
## **Web application**
```
cd web
```
Install all dependencies and run dev command.

> In this project we are using yarn. Before you do the next steps if you haven't downloaded yarn do the following.

<details open>

  <summary>Install <b>yarn</b></summary>
  <br/>

  ```
  npm i -g yarn
  ```

</details>

<br/>

```
yarn dev
```

If you wanna build

```
yarn build
```

This is where you want to run your mobile app.

## **Mobile app**

Firstly
```
cd app/mobile
```
Make sure you have downloaded all package dependencies

Check it out `package.json`

**Android**

```
yarn android
```

**IOS**

```
yarn ios
```

**Web**

```
yarn web
```

### Backend

```bash
  git clone https://github.com/Folody-Team/Shartube/
```

Go to the project directory

```bash
  cd Shartube
  cd server
```

Start the server

```bash
  go run github.com/cosmtrek/air
```
Make sure you installed [**Golang**](https://go.dev/), [**NodeJs**](https://nodejs.org/).

## Tech Stack

**Client:** Next.js, React, Redux, TailwindCSS,...

**Server:** Golang, Mux, Net/http,...

## Support

For support, [join our Discord server](https://discord.gg/BbKvjwsYwM).

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.
