import React from 'react';
import { Auth } from 'aws-amplify';

import { DataStore, Predicates } from '@aws-amplify/datastore';
import { Task } from './models';

class AppWrapper extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            text: 'hallo world',
            isAdmin: false,
            formDuration: '',
            formDescription: '',
            tasks: []
        };
    }

    componentDidMount() {
        Auth.currentAuthenticatedUser().then((user) => {
            this.setState({
                isAdmin: (!!user.signInUserSession.accessToken.payload["cognito:groups"] && user.signInUserSession.accessToken.payload["cognito:groups"].includes('admin'))
            })
        })

        this.fetchTasks();

        this.subscription = DataStore.observe(Task).subscribe(msg => {
            this.fetchTasks();
        })
    }

    formChangeDuration(event){
        this.setState({ formDuration: event.target.value });
    }

    formChangeDescription(event){
        this.setState({ formDescription: event.target.value });
    }

    fetchTasks = async() => {
        const tasks = await DataStore.query(Task,Predicates.ALL);
        const t = tasks.map(entry => ({
            id: entry.id,
            duration: entry.duration,
            description: entry.description,
            owner: entry.owner
        }));
        console.log('[fetchTasks]',t);

        this.setState({ tasks: t })
    }

    formSubmit = async(event) => {
        alert(this.state.formDuration + ' / ' + this.state.formDescription);
        event.preventDefault();

        const task = new Task({
            duration: this.state.formDuration,
            description: this.state.formDescription
        })

        await DataStore.save(task);
    }

    render(){
        return (
            <>
                <h1>Account Info</h1>
                <div><b>sub:</b> { JSON.stringify(this.props.user.attributes.sub) }</div>
                <div><b>email:</b> { JSON.stringify(this.props.user.attributes.email) }</div>
                <div><b>email_verified:</b> { JSON.stringify(this.props.user.attributes.email_verified) }</div>
                <div><b>isAdmin:</b> { this.state.isAdmin + '' }</div>

                <div style={{display: 'flex'}}>
                    <div style={{ flex: '0 0 50%'}}>
                        <h1>Task Form</h1>
                        <form onSubmit={(e) => this.formSubmit(e)}>
                            <label>Task Duration</label><br/>
                            <input type='text' value={this.state.formDuration} onChange={(e) => this.formChangeDuration(e)}/><br/><br/>

                            <label>Task Description</label><br/>
                            <input type='text' value={this.state.formDescription} onChange={(e) => this.formChangeDescription(e)}/><br/><br/>

                            <button className='button' type='submit'>Submit</button>
                        </form>
                    </div>
                    <div style={{ flex: '0 0 50%'}}>
                        <h1>My Tasks</h1>
                        {this.state.tasks.filter(task => task.owner === this.props.user.attributes.sub).map((task,index) => {
                            return <div key={index} style={{ display: 'flex', width: '100%', borderBottom: '1px solid rgba(0,0,0,0.25)', paddingBottom: '7.5px', marginBottom: '7.5px'}}>
                                <div style={{ flex: '0 0 50px'}}>{task.duration}</div>
                                <div style={{ flex: '1 1 auto'}}>{task.description}</div>
                            </div>
                        })}
                    </div>
                </div>


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
                                <div style={{ flex: '0 0 350px'}}>{task.owner}</div>
                                <div style={{ flex: '0 0 150px'}}>{task.duration}</div>
                                <div style={{ flex: '1 1 auto'}}>{task.description}</div>
                            </div>
                        })}
                    </div>
                    : <div></div>
                }
                
                
            </>
        )
    }
}

export default AppWrapper