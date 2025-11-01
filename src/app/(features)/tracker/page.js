import DailyTasks from "@/components/tracker/dailyTracker";
import Tree from "@/components/tracker/tree";
import TreeTracker from "@/components/tracker/treeTracker";

export default function Tracker() {
    return (
        <div>
            <DailyTasks />
            <Tree />
            {/* <TreeTracker /> */}
         
        </div>
    )
}