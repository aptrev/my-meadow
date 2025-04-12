import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export default function AppModal({title, body, show, onHide, options, ...props}) {
    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            aria-labelledby="Clear Gardens Modal"
            centered
            animation={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {body}
            </Modal.Body>
            <Modal.Footer>
                {/* <ButtonGroup> */}
                    {options && options.map((option, index) => {
                        const {label, onClick, ...optionProps} = option;
                        return <Button key={index} onClick={() => onClick()} {...optionProps} >{label}</Button>;
                    })}
                {/* </ButtonGroup> */}
            </Modal.Footer>
        </Modal>
    );
}