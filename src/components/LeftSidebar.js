import React from "react";
import { PiPlantFill } from "react-icons/pi";

import "../style/toolbar.css";

// Bootstrap Imports
import ToggleButton from "react-bootstrap/esm/ToggleButton";
import Stack from "react-bootstrap/Stack";
import { CircleSquare, CaretDownFill, LayoutTextSidebarReverse, Question } from 'react-bootstrap-icons'
import { GiStonePath } from "react-icons/gi";
import { LuFence } from "react-icons/lu";
import { RxText } from "react-icons/rx";

import '../style/home.css';
import '../style/outdooredit.css';

const sidebar = [
    {
        id: 'tool-garden',
        value: 'garden',
        label: 'Garden',
        icon: <LayoutTextSidebarReverse fill='currentColor' size={20} />
    },
    {
        id: 'tool-plots',
        value: 'plot',
        label: 'Plots',
        icon: <CircleSquare fill='currentColor' size={20} />
    },
    {
        id: 'tool-plants',
        value: 'plants',
        label: 'Plants',
        icon: <PiPlantFill fill='currentColor' size={20} />
    },
    {
        id: 'tool-paths',
        value: 'paths',
        label: 'Paths',
        icon: <GiStonePath fill='currentColor' size={20} />
    },
    {
        id: 'tool-objects',
        value: 'objects',
        label: 'Objects',
        icon: <LuFence fill='currentColor' size={20} />
    },
    {
        id: 'tool-text',
        value: 'text',
        label: 'Text',
        icon: <RxText fill='currentColor' size={20} />
    },
    {
        id: 'tool-help',
        value: 'help',
        label: 'Help',
        icon: <Question fill='currentColor' size={20} />
    },
]

export default function LeftSidebar({ tool, onChangeTool, garden, options }) {

    return (
        <div
            className='p-2 zindex-sticky'
            style={{ backgroundColor: 'var(--secondaryLightGreen)', height: 'calc(100dvh - 75px)'}}
        >
            <div className='d-flex flex-column justify-content-center align-items-center position-relative'>
                <div 
                className='sidebar-label position-absolute top-0 d-flex flex-column justify-content-center align-items-center p-1'
                style={{zIndex: '0'}}>
                    <span>Select</span>
                    <span>Tool</span>
                </div>
                <Stack gap={2} className='overflow-auto py-1 h-100' 
                style={{marginTop: '50px', scrollMarginTop: '0px', zIndex: 1}}>
                    {
                        sidebar.map((item) => {
                            const disabled = item.value === 'paths' || item.value === 'text' || item.value === 'help';
                            return (
                                <ToggleButton
                                    key={item.id}
                                    id={item.id}
                                    className={`${(item.value === tool) ? 'active' : ''}`}
                                    checked={item.value === tool}
                                    type='checkbox'
                                    variant='tool'
                                    value={item.value}
                                    onChange={(e) => onChangeTool(e.currentTarget.value)}
                                    disabled={disabled}
                                    aria-label={!disabled ? item.label : 'Tool Disabled'}
                                    title={!disabled ? item.label : 'Under Construction'}
                                >
                                    <div className='d-flex flex-column justify-content-center align-items-center'>
                                        <CaretDownFill size={12} opacity={(item.value === tool ? 1 : 0)} />
                                        {item.icon}
                                        <span className='folder-label'>{item.label}</span>
                                    </div>
                                </ToggleButton>
                            );
                        })
                    }
                </Stack>
            </div>

        </div>
    );
}