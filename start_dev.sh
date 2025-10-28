#!/bin/bash

if  [[ $1 = "-full" ]]; then
    # install battle npm packages
    npm install

    # generate xml
    python3 scripts/generate_cards.py

    # generate cards
    python3 scripts/generate_card_images.py

    # nav to frontend to start server
    cd frontend

    #install frontend npm packages
    npm install

    # run the npm dev server
    npm run dev

else
    # nav to frontend to start server
    cd frontend

    # Run the npm dev script
    npm run dev

fi