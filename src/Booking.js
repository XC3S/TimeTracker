import React from 'react';
import { Auth, DataStore } from 'aws-amplify';
import { Task } from './models';
import { Calendar, Input, Button, Row, Col, Modal, Slider, Badge } from 'antd';
import moment from 'moment';

class Booking extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            formDuration: '',
            formDurationM: 0,
            formDurationH: 0,
            formDescription: '',
            modalVisible: false,
            selectedDate: moment() //moment('12/11/2018','L')
        }
    }

    componentDidMount() {
        
    }

    formChangeDuration(event){
        this.setState({ formDuration: event.target.value });
    }

    formChangeDescription(event){
        this.setState({ formDescription: event.target.value });
    }

    formTaskSubmit = async(event) => {
        event.preventDefault();
        this.createOrUpdateTask();
    }

    createOrUpdateTask = async() => {
        const user = await Auth.currentAuthenticatedUser();
        const existing = await DataStore.query(Task, t => t.owner('eq', user.attributes.sub).date('eq', this.state.selectedDate.format('L')));

        console.log('[existing] ',existing);
        
        if(existing.length === 0){
            const task = new Task({
                duration: moment().hour(this.state.formDurationH).minutes(this.state.formDurationM).format('HH:mm'),
                description: this.state.formDescription,
                userName: this.props.userAttributes.name,
                date: this.state.selectedDate.format('L')
            });

            await DataStore.save(task);
        }
        else {
            const original = await DataStore.query(Task, existing[0].id);
            await DataStore.save(
                Task.copyOf(original, updated => {
                    updated.duration = moment().hour(this.state.formDurationH).minutes(this.state.formDurationM).format('HH:mm');
                    updated.description = this.state.formDescription;
                })
            );
        }

        this.setState({
            formDescription: '',
            formDuration: '',
            modalVisible: false
        })
    }

    onSelect = (date) => {
        let filtered = this.props.tasks.filter(t => t.date === date.format('L'));

        if(filtered.length > 0){
            this.setState({
                formDurationH: Number(moment(filtered[0].duration,'HH:mm').format('H')),
                formDurationM: Number(moment(filtered[0].duration,'HH:mm').format('m')),
                formDescription: filtered[0].description,
                selectedDate: date,
                modalVisible: true,
            });    
        }
        else {
            this.setState({
                formDurationH: 0,
                formDurationM: 0,
                formDescription: '',
                selectedDate: date,
                modalVisible: true,
            });
        }
    };

    handleOk = () => {
        this.createOrUpdateTask();
    };

    handleCancel = e => {
        console.log('cancel', e);
        this.setState({
            modalVisible: false,
        });
    };
    
    dateCellRender = (value) => {
        let found = this.props.tasks.filter(t => t.date === value.format('L'));
        if (found.length > 0) {
            return (
                <Badge status={'success'} text={found[0].description} />
            );
        }
        else {
            return (
                <div></div>
            );
        }
    }

    render(){
        return <>
            <Calendar value={this.state.selectedDate} onSelect={this.onSelect} dateCellRender={this.dateCellRender}/> 
            <Modal
                title={this.state.selectedDate.format('MMMM Do YYYY')}
                visible={this.state.modalVisible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
            >
               
                <form onSubmit={(e) => this.formTaskSubmit(e)}>
                    <Row gutter={30}>
                        <Col span={18}>
                            <h2>Duration</h2>
                        </Col>
                        <Col span={6}>
                            <h1>{moment().hour(this.state.formDurationH).minutes(this.state.formDurationM).format('HH:mm')}</h1>
                        </Col>
                    </Row>
                    
                    <Slider marks={{0: '0h', 1: '1h', 2: '2h', 3: '3h', 4: '4h', 5: '5h', 6: '6h', 7: '7h', 8: '8h'}}  
                            min={0} 
                            max={8} 
                            step={null} 
                            value={this.state.formDurationH} 
                            onChange={(v) => {this.setState({formDurationH: v})}}
                    />
                    <Slider marks={{0: '0min', 15: '15min', 30: '30min', 45: '45min'}}  
                            min={0} 
                            max={60} 
                            step={null} 
                            value={this.state.formDurationM} 
                            onChange={(v) => {this.setState({formDurationM: v})}}
                    />
                    <h2><br/>Description</h2>
                    <Input.TextArea type='text' value={this.state.formDescription} onChange={(e) => this.formChangeDescription(e)} autoSize={{ minRows: 5}}/>
                </form>
            </Modal>
        </>
    }
}

export default Booking