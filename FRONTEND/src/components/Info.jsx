import Popover from './popover/Popover'
import PopoverHandler from './popover/PopoverHandler'
import { IconHelp } from '@tabler/icons-react'
import PopoverContent from './popover/PopoverContent'
import { bool, node, string } from '../tools/Types'

function Info({
    classHelper,
    position = "bottom-start",
    showIndicator = true,
    children
}) {
    return (
        <Popover>
            <PopoverHandler>
                <button className={"transition-all duration-200 hover:bg-blue-dark size-8 flex justify-center items-center rounded-lg "+classHelper}>
                    <IconHelp className="w-6 h-6 opacity-70" />
                </button>
            </PopoverHandler>
            <PopoverContent
                position={position}
                showIndicator={showIndicator}
            >

                {children}
            </PopoverContent>
        </Popover>
    )
}

Info.propTypes = {
    classHelper: string,
    position: string,
    showIndicator: bool,
    children: node
}

export default Info