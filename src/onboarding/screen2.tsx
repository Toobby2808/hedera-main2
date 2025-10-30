
import Onboarding from "./shared/hero";
import { ellipse } from "../assets/images";
import { useNavigate } from 'react-router-dom';

export default function Screen2() {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        console.log("Button clicked, attempting to navigate");
        navigate('/signup');
    };


    return (
        <div className="h-screen bg-gradient-to-br from-emerald-50 to-teal-50 w-full flex flex-col justify-between">
            <Onboarding
                title="Discover New Moments Within Campus And Others"
                image={ellipse}
                onButtonClick={handleGetStarted}


            />


        </div>
    );
}
