import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
    
    const navigate = useNavigate();

    function handleClick() {
        navigate("/age");
    }

    function handleSubmit(event) {
        event.preventDefault();
    }
    
    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <p className='extra-text'>Create an Account</p>
            <input name="email" placeholder="email@domain.com"/>
            <input name="password" placeholder="password"/>
            <button 
                className="button"
                id="login-button"
                onClick={handleClick}
            >
                Continue
            </button>
        </form>
    );
}