const Card = (props)=>
{
    return (
        <div className = "lg:w-[23vw] md:w-[30vw] sm:w-[45vw] rounded-xl py-8 px-8 flex items-center flex-col text-center bg-white text-black">
            <img className='h-24 w-24 rounded-full object-center object-cover' src = {props.elem.profilePic} alt = {props.elem.username}></img>
            <h1 className = "text-2xl font-bold">{props.elem.username}</h1>
           <h5 className=' text-blue-500 text-lg font-semibold my-2'>{props.elem.userRole}</h5>
            <p className='text-sm font-medium leading-tight'>{props.elem.userDesc}</p>
        </div>
    )
}

export default Card;