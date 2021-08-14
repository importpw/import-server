import React from 'react';
import CodeExec from './code-exec';
import NewWindow from 'react-new-window';

export default class CodeExample extends React.Component {
	constructor(...args) {
		super(...args);
		this.state = {
			showing: false,
		};
		this.runExample = this.runExample.bind(this);
		this.onWindowClose = this.onWindowClose.bind(this);
	}

	runExample(e) {
		e.preventDefault();
		this.setState({ showing: true });
	}

	onWindowClose() {
		this.setState({ showing: false });
	}

	render() {
		let overlay;
		if (this.state.showing) {
			overlay = (
				<NewWindow
					center="parent"
					copyStyles={true}
					disableStdin={true}
					features={{ width: 600, height: 384 }}
					name="code-example"
					onUnload={this.onWindowClose}
					title="Code Example"
				>
					<CodeExec code={this.props.code} />
				</NewWindow>
			);
		}
		return (
			<div className="code-example">
				{this.props.children}
				<a className="run" onClick={this.runExample} href="#">
					Run this code
				</a>
				{overlay}

				<style jsx>{`
					.code-example {
						position: relative;
					}

					.run {
						position: absolute;
						top: 0;
						right: 0;
						padding: 6px;
						font-size: 0.75em;
						border-left: 1px solid #eaeaea;
						border-bottom: 1px solid #eaeaea;
					}
				`}</style>
			</div>
		);
	}
}
