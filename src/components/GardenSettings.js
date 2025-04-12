import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";


export default function GardenSettings({ garden, onUpdateGarden }) {

    return (
        <div className='w-100'>
            {garden &&
                <ListGroup>
                    <ListGroup.Item style={{backgroundColor: 'transparent'}}>
                        <InputGroup className='garden-settings-input w-100'>
                            <InputGroup.Text id="basic-addon1">Name</InputGroup.Text>
                            <Form.Control
                                placeholder={garden.name}
                                aria-label="Name"
                            />
                        </InputGroup>
                    </ListGroup.Item>
                </ListGroup>

            }
        </div>

    );
}