

export function PlansPopUp({ getPlans }) {
    return (
        <div>
            {["one", "two", "three"].map(item => (
                <li key={item}>
                    <button onClick={() => getPlans()}>{item}</button>
                </li>
            ))}
        </div>
    )
}