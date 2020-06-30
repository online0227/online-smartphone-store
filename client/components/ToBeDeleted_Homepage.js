

import React from "react"
import {withRouter} from 'react-router-dom';
import "../styles/ToBeDeleted_Homepage.css"
import ToBeDeleted_Card from "./ToBeDeleted_Card";

const words = [   
                {"name" : "chain", "description" : "necklace chain", "quantity": 15}, 
                {"name": "pen", "description" : "ball pen", "quantity": 11}, 
                {"name": "book", "description" : "travel diary", "quantity": 12},
                {"name": "brush", "description" : "paint brush", "quantity": 33}
              ];

const Homepage = (props) => (
          <div className="welcome">
            <br />
          <h1>Welcome to the website!</h1>
          <button onClick={(e) => {
            props.history.push('/test2/withredux');
          }}>
              Click here to check if history works
            </button>
            <br />
            <h2>Following is SSR test on mapping:</h2>
            <div>
              {words.map((word, i) => (
                    <div key={i}>
                        <ToBeDeleted_Card product={word} />
                    </div>
                ))}
            </div>
        </div>
)

export default withRouter(Homepage);

