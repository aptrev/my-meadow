import React, { useState, useEffect, useRef, useCallback } from "react";

import "../style/toolbar.css";

// Bootstrap Imports
import Button from "react-bootstrap/esm/Button";
import Stack from "react-bootstrap/Stack";
import { TbChevronCompactLeft } from "react-icons/tb";

import '../style/home.css';
import '../style/outdooredit.css';

export default function ToolPicker({ tool, onHide, options }) {

    return (
        <div className='toolpicker-picker-wrapper position-relative'>
            <div
                className={`${(tool) ? 'expanded' : ''} tool-picker p-0 m-0 position-relative`}
                style={{ backgroundColor: 'var(--secondaryLightGreen)', height: 'calc(100dvh - 75px)', marginBottom: '75px', scrollMarginTop: '75px' }}
            >
                <div className='toolpicker-content p-2 d-flex flex-column justify-content-center align-items-center'>
                    <div
                        className='sidebar-label top-0 d-flex flex-column justify-content-center align-items-center p-1'
                        style={{ zIndex: '0' }}>
                        <span>Select</span>
                        <span>Tool</span>
                    </div>
                </div>
            </div>

            <Button
                className={`${(tool) ? 'expanded' : ''} p-0 m-0 position-absolute h-100 top-0 bottom-0`}
                variant='collapse'
                onClick={(e) => onHide(null)}>
                <div>
                    <TbChevronCompactLeft stroke="white" size={24} />
                </div>
            </Button>
        </div>
    );
}