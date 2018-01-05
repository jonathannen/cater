# Cater example: Deploy to Now

Example for deployment to Zeit [Now](https://zeit.co/now) Service.

You can see this example running on Now at [https://now-mmtjcwkqne.now.sh/](https://now-mmtjcwkqne.now.sh/).

## Instructions

Fortunately, Now makes life really simple.

    yarn install

To see the App running locally, run:

    yarn run dev

To deploy to now, you can use the now CLI directly. The command below publishes this application as an Open-Source public project:

    now --public

You can also use the following, but same-same under the hood:

    yarn run deploy
