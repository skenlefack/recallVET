import React from "react";

const Footer = (props) => {
	var d = new Date();
	return (
		<div className={`footer ${props.changefoot}`}>
			<div className="copyright">
				<p>Copyright © 					
					{" "}Developed by{" "}
					<a href="http://dexignzone.com/" target="_blank"  rel="noreferrer">
						DexignZone
					</a>{" "}
					{d.getFullYear()}
				</p>
			</div>
		</div>
	);
};

export default Footer;
