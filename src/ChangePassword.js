import React from 'react';
import { Auth } from 'aws-amplify';
import { Input, Button} from 'antd';

class ChangePassword extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            oldPassword: '',
            newPassword: ''
        }
    }

    formChangeOldPassword(event){
        this.setState({ oldPassword: event.target.value });
    }

    formChangeNewPassword(event){
        this.setState({ newPassword: event.target.value });
    }

    formChangePasswordSubmit = async(event) => {
        event.preventDefault();

        const user = await Auth.currentAuthenticatedUser();
        
        Auth.changePassword(user, this.state.oldPassword, this.state.newPassword).then(msg => {
            this.setState({
                oldPassword: '',
                newPassword: ''
            })
        });
    }

    render(){
        return <>
            <form onSubmit={(e) => this.formChangePasswordSubmit(e)}>
                <h2>Change Password</h2>
                <label>Old Passworld</label><br/>
                <Input type='password' value={this.state.oldPassword} onChange={(e) => this.formChangeOldPassword(e)}/><br/><br/>
                <label>New Password</label><br/>
                <Input type='password' value={this.state.formFullName} onChange={(e) => this.formChangeNewPassword(e)}/><br/><br/>
                <Button type="primary">Submit</Button>
            </form>
        </>
    }
}

export default ChangePassword