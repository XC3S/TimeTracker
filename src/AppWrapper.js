import React from 'react';
import { Auth } from 'aws-amplify';

import { DataStore, Predicates } from '@aws-amplify/datastore';
import { Task } from './models';

import Navigation from './Navigation.js';
import ChangePassword from './ChangePassword.js';
import ChangeUserName from './ChangeUserName.js';
import Booking from './Booking.js';

import { Input, Button } from 'antd';

import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";

class AppWrapper extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            isAdmin: false,
            tasks: [],
            requireNameInput: false,
            formFullName: '',
            userAttributes: []
        };
    }

    componentDidMount() {
        this.fetchUserAttributes();
        this.fetchTasks();

        this.subscription = DataStore.observe(Task).subscribe(msg => {
            this.fetchTasks();
        })
    }

    fetchUserAttributes = async() => {
        Auth.currentAuthenticatedUser().then((user) => {
            Auth.userAttributes(user).then(attributes => {
                const a = [];
                attributes.forEach(org => {
                    a[org['Name']] = org['Value'];
                })

                var requireNameInput = !a.name;
                this.setState({
                    userAttributes: a,
                    requireNameInput: requireNameInput,
                    isAdmin: (!!user.signInUserSession.accessToken.payload["cognito:groups"] && user.signInUserSession.accessToken.payload["cognito:groups"].includes('admin'))
                })
            })
        })
    }



    formChangeFullName(event){
        this.setState({ formFullName: event.target.value });
    }

    fetchTasks = async() => {
        const tasks = await DataStore.query(Task,Predicates.ALL);
        const t = tasks.map(entry => ({
            id: entry.id,
            duration: entry.duration,
            description: entry.description,
            owner: entry.owner,
            userName: entry.userName,
            date: entry.date
        }));

        this.setState({ tasks: t })
    }

    formFullNameSubmit = async(event) => {
        //alert(this.state.formFullName);
        event.preventDefault();

        const user = await Auth.currentAuthenticatedUser();
        
        Auth.updateUserAttributes(user,{
            name: this.state.formFullName
        }).then(() => {
            this.fetchUserAttributes();
        });
    }

    render(){
        return (
            (this.state.requireNameInput 
                ? <>
                    <div>
                        <form onSubmit={(e) => this.formFullNameSubmit(e)}>
                            <h2>Enter Name</h2>
                            <pre>requireNameInput: {this.state.requireNameInput + ''}</pre>
                            <label>Full Name</label><br/>
                            <Input type='text' placeholder='Max Musterman' value={this.state.formFullName} onChange={(e) => this.formChangeFullName(e)}/><br/><br/>
                            <Button type="primary">Submit</Button>
                        </form>
                    </div>
                </>
                : <>
                    <Router>
                        <Navigation isAdmin={this.state.isAdmin}></Navigation>
                        <Switch>
                            <Route path="/admin">
                            {this.state.isAdmin 
                                ? <div>
                                    <h1>Admin</h1>
                                    <div style={{ display: 'flex', width: '100%', marginBottom: '15px'}}>
                                        <div style={{ flex: '0 0 350px'}}><b>User</b></div>
                                        <div style={{ flex: '0 0 150px'}}><b>Duration</b></div>
                                        <div style={{ flex: '1 1 auto'}}><b>Description</b></div>
                                    </div>
                                    {this.state.tasks.map((task,index) => {
                                        return <div key={index} style={{ display: 'flex', width: '100%', borderBottom: '1px solid rgba(0,0,0,0.25)', paddingBottom: '7.5px', marginBottom: '7.5px'}}>
                                            <div style={{ flex: '0 0 350px'}}>{task.userName}</div>
                                            <div style={{ flex: '0 0 150px'}}>{task.duration}</div>
                                            <div style={{ flex: '1 1 auto'}}>{task.description}</div>
                                        </div>
                                    })}
                                </div>
                                : <div></div>
                            }  
                            </Route>
                            <Route path="/profile">
                                <h1>Account Info</h1>

                                {Object.keys(this.state.userAttributes).map((keyName,keyIndex) => {
                                    return <div key={keyIndex}><b>{keyName}:</b> {this.state.userAttributes[keyName] + ''}</div>
                                })}

                                <div><b>isAdmin:</b> { this.state.isAdmin + '' }</div>
                                <pre>requireNameInput: {this.state.requireNameInput + ''}</pre>
                                <ChangePassword />
                                <ChangeUserName name={ this.state.userAttributes.name } onSuccess={() => { 
                                    console.log('onSuccess');
                                    this.fetchUserAttributes();
                                }}/>
                            </Route>
                            <Route path="/">
                                <Booking userAttributes={ this.state.userAttributes } tasks={ this.state.tasks }/>
                            </Route>
                        </Switch>
                    </Router>
                </>
            )
        )
    }
}

export default AppWrapper