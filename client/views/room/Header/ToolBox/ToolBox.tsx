import React, { memo, useContext, useEffect, ReactNode } from 'react';
import { Menu, Option, BoxProps } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import tinykeys from 'tinykeys';

// used to open the menu option by keyboard

import Header from '../../../../components/basic/Header';
import { ToolboxContext } from '../../../../channel/lib/Toolbox/ToolboxContext';
import { useTranslation } from '../../../../contexts/TranslationContext';
import { ToolboxActionConfig } from '../../../../channel/lib/Toolbox';
import { useLayout } from '../../../../contexts/LayoutContext';
import { useTab, useTabBarOpen } from '../../providers/ToolboxProvider';

const renderHeaderAction: ToolboxActionConfig['renderAction'] = (
	{ id, icon, title, action, className, tabId },
	index,
) => <Header.ToolBoxAction
	className={className}
	primary={id === tabId}
	data-toolbox={index}
	onClick={action}
	title={title}
	key={id}
	icon={icon}
/>;

const ToolBox = ({ className }: { className: BoxProps['className'] }): JSX.Element => {
	const tab = useTab();
	const openTabBar = useTabBarOpen();
	const { isMobile } = useLayout();
	const t = useTranslation();
	const { actions: mapActions } = useContext(ToolboxContext);
	const actions = (Array.from(mapActions.values()) as ToolboxActionConfig[]).sort((a, b) => (a.order || 0) - (b.order || 0));
	const visibleActions = isMobile ? [] : actions.slice(0, 6);
	const hiddenActions = Object.fromEntries((isMobile ? actions : actions.slice(6)).map((item) => [item.id, {
		label: { label: item.title, icon: item.icon },
		// ...item,
		action: (): void => {
			openTabBar(item.id);
		},
	}]));

	const actionDefault = useMutableCallback((e) => {
		const index = e.currentTarget.getAttribute('data-toolbox');
		openTabBar(actions[index].id);
	});

	const open = useMutableCallback((index) => {
		openTabBar(actions[index].id);
	});

	useEffect(() => {
		if (!visibleActions.length) {
			return;
		}
		const unsubscribe = tinykeys(window, Object.fromEntries(new Array(visibleActions.length).fill(true).map((_, index) => [`$mod+${ index + 1 }`, (): void => { open(index); }])));

		return (): void => {
			unsubscribe();
		};
	}, [visibleActions.length, open]);


	return <>
		{ visibleActions.map(({ renderAction = renderHeaderAction, title, ...action }, index) => renderAction({ action: actionDefault, ...action, className, tabId: tab?.id, title: t(title) }, index)) }
		{ actions.length > 6 && <Menu
			small={!isMobile}
			className={className}
			aria-keyshortcuts='alt'
			tabIndex={-1}
			options={hiddenActions}
			renderItem={({ label: { label, icon }, ...props }: { label: any }): ReactNode => <Option label={t(label)} title={t(label)} icon={icon} {...props}/>}
		/>}
	</>;
};

export default memo(ToolBox);
