



interface backProps {
    title?: string;
    text?: string;
    image?: string;
    onButtonClick?: () => void;
}



export default function Back({
    title,
    text,
    image,
    onButtonClick,
}: backProps) {
    return (


        <div className="py-4">

            <button className="pb-10" onClick={onButtonClick}><img src={image} alt="back-icon" /></button>



            <div className="flex flex-col gap-6">
                <h2 className='font-extrabold text-xl'>{title}</h2>
                <p className='text-md'>{text}</p>

            </div>


        </div>
    );



}