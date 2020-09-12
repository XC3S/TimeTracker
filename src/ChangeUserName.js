import React from 'react';
import { Auth, DataStore } from 'aws-amplify';
import { Task } from './models';
import { Input, Button} from 'antd';

class ChangeUserName extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            newName: '',
        }
    }

    componentDidMount() {
        this.setState({
            newName: this.props.name
        })
    }

    formChangeName(event){
        this.setState({ newName: event.target.value });
    }

    formChangeNameSubmit = async(event) => {
        event.preventDefault();

        const user = await Auth.currentAuthenticatedUser();
        
        await Auth.updateUserAttributes(user, {
            name: this.state.newName
        });

        const myTasks = await DataStore.query(Task, t => t.owner('eq', user.attributes.sub));
        myTasks.forEach( async (t) => {
            const original = await DataStore.query(Task, t.id);
            await DataStore.save(
                Task.copyOf(original, updated => {
                    updated.userName = this.state.newName;
                })
            );
        })

        this.props.onSuccess();
    }

    render(){
        return <>
            <form onSubmit={(e) => this.formChangeNameSubmit(e)}>
                <h2>Change User Name</h2>
                <label>New Name</label><br/>
                <Input type='text' defaultValue={this.props.name} onChange={(e) => this.formChangeName(e)}/><br/><br/>
                <Button type="primary">Submit</Button>
            </form>
        </>
    }
}

export default ChangeUserName