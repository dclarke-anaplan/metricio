import React from 'react';

import './styles.scss';

import {makeStyles} from '@material-ui/core/styles';
import BaseWidget from "../base";
import {Typography} from "@material-ui/core";
import ListItemText from "@material-ui/core/ListItemText";
import ListItem from "@material-ui/core/ListItem";

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        flexGrow: 1,
        position: "relative",
        margin: "0 auto",
        textAlign: "center",
        padding: "1.25rem",
        maxWidth: "99vw",
        width: "98.3vw",
        height: "25vh",
        display: "inline",
        float: "left",
        clear: "left",
        overflowY: "scroll"
    },
    title: {
        margin: theme.spacing(-1, 0, 1),
    },
    primary: {
        fontSize: "1.1rem"
    }
}));


export default class ListWidget extends BaseWidget {
    constructor(props) {
        super(props);
        this.state = {entries: []};
    }

    render() {
        if (this.state.entries.length !== 0) {
            return (
                <div className={"centered"}>
                    {/*<div className={"left"}>*/}
                    <InteractiveListWidget entries={this.state.entries}/>
                    {/*<div className={"right"}>*/}
                    {/*    <InteractiveListWidget entries={this.state.entries}/>*/}
                    {/*</div>*/}
                </div>
            );
        } else {
            return (<div/>)
        }
    }
}

function Title(props) {
    return (
        <Typography className={useStyles().title} variant={"h6"} gutterBottom>{props.title}</Typography>
    )
}

function InteractiveListWidget(props) {
    var columns = [];
    var column = [];

    props.entries.forEach((item) => {
        if (column.length < 3) {
            column.push(item);
        } else {
            columns.push(column);
            column = [item]
        }
    });
    columns.push(column)

    return (
        <div className={useStyles().root}>
            <div className="row">
                {columns.map((col, colIndex) => (
                    <div className={"column"} key={colIndex}>
                        <ul style={{ listStyleType: "none" }}>
                            {col.map((item, index) => (
                                <ListItem key={index} component="nav">
                                    <a href={item[3]} style={{ textDecoration: "none" }}>
                                    <ListItemText
                                        primary={item[2]} primaryTypographyProps={{fontSize: "7px"}}
                                        secondary={item[0] + " #" + item[1]}
                                        secondaryTypographyProps={{fontSize: "7px"}}/>
                                    </a>
                                </ListItem>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    )
}

ListWidget.propTypes = {};
