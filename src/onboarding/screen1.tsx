import { hederalogo } from "../assets/images";
import Onboarding from "./shared/hero";

import { useNavigate } from 'react-router-dom';
export default function screen1() {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        console.log("Button clicked, attempting to navigate");
        navigate('/welcome');
    };


    return (
        <div>
            <Onboarding
                image={hederalogo}
                onButtonClick={handleGetStarted} />
        </div>
    );
}
