import React from 'react';
import { Menu } from 'antd';
import { ClockCircleOutlined, UserOutlined, AuditOutlined, LogoutOutlined, IdcardOutlined} from '@ant-design/icons';

import { Auth } from 'aws-amplify';

import { Link } from "react-router-dom";

const { SubMenu } = Menu;

class Navigation extends React.Component {
    state = {
        current: 'booking',
    };

    handleClick = e => {
        console.log('click ', e);

        if (e.key === 'sign-out') {
            Auth.signOut();
            return
        }

        this.setState({ current: e.key });
    };

    render() {
        const { current } = this.state;
        return (
            <Menu onClick={this.handleClick} selectedKeys={[current]} mode="horizontal">
                <Menu.Item key="booking" icon={<ClockCircleOutlined />}>
                    <Link to="/">Booking</Link>
                </Menu.Item>
                <SubMenu key="SubMenu" icon={<UserOutlined />} title="Profile">
                    <Menu.Item key="personal-section" icon={<IdcardOutlined />}>
                        <Link to="/profile">Personal Informations</Link>
                    </Menu.Item>
                    <Menu.Item key="sign-out" icon={<LogoutOutlined />}>Sign Out</Menu.Item>
                </SubMenu>
                <Menu.Item key="admin" icon={<AuditOutlined />}>
                    <a href="https://ant.design" target="_blank" rel="noopener noreferrer">
                        Admin
                    </a>
                </Menu.Item>
            </Menu>
        );
    }
}


export default Navigation